import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PaymentRepository } from './payment.repository';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { UploadProofDto } from './dto/upload-proof.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CreateProofPaymentDto } from './dto/create-proof-payment.dto';
import { InitiateWebpayDto } from './dto/initiate-webpay.dto';
import { WebpayCallbackDto } from './dto/webpay-callback.dto';
import { ValidateProofDto } from './dto/validate-proof.dto';
import { Payment, PaymentStatus } from '../database/schemas';
import { S3Service } from '../s3/s3.service';
import { WebpayService } from './webpay.service';

@Injectable()
export class PaymentService {
  constructor(
    private paymentRepository: PaymentRepository,
    private s3Service: S3Service,
    private webpayService: WebpayService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = await this.paymentRepository.create({
      ...createPaymentDto,
      amount: createPaymentDto.amount.toString(),
      status: createPaymentDto.status || 'pending',
    });

    return payment;
  }

  async findAll(): Promise<Payment[]> {
    return await this.paymentRepository.findAll();
  }

  async findById(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async findByCartId(cartId: string): Promise<Payment[]> {
    return await this.paymentRepository.findByCartId(cartId);
  }

  async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    return await this.paymentRepository.findByStatus(status);
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const existingPayment = await this.findById(id);

    const updatedPayment = await this.paymentRepository.update(id, {
      ...updatePaymentDto,
      amount: updatePaymentDto.amount
        ? updatePaymentDto.amount.toString()
        : undefined,
    });

    if (!updatedPayment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return updatedPayment;
  }

  async updateStatus(id: string, status: PaymentStatus): Promise<Payment> {
    const existingPayment = await this.findById(id);

    // Validate status transition
    this.validateStatusTransition(existingPayment.status, status);

    const updatedPayment = await this.paymentRepository.updateStatus(id, status);

    if (!updatedPayment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return updatedPayment;
  }

  async uploadProof(
    id: string,
    uploadProofDto: UploadProofDto,
  ): Promise<Payment> {
    const existingPayment = await this.findById(id);

    const updatedPayment = await this.paymentRepository.uploadProof(
      id,
      uploadProofDto.proofUrl,
      uploadProofDto.notes,
    );

    if (!updatedPayment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    // Update status to processing if it was pending
    if (existingPayment.status === 'pending') {
      return await this.updateStatus(id, 'processing');
    }

    return updatedPayment;
  }

  async confirmPayment(
    id: string,
    confirmPaymentDto: ConfirmPaymentDto,
  ): Promise<Payment> {
    const existingPayment = await this.findById(id);

    if (existingPayment.status === 'completed') {
      throw new BadRequestException('Payment is already confirmed');
    }

    const updatedPayment = await this.paymentRepository.update(id, {
      status: 'completed',
      transactionId: confirmPaymentDto.transactionId,
      externalReference: confirmPaymentDto.externalReference,
      notes: confirmPaymentDto.notes || existingPayment.notes,
      confirmedAt: new Date(),
      paymentDate: new Date(),
    });

    if (!updatedPayment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return updatedPayment;
  }

  async cancelPayment(id: string, reason?: string): Promise<Payment> {
    const existingPayment = await this.findById(id);

    if (existingPayment.status === 'completed') {
      throw new BadRequestException('Cannot cancel a completed payment');
    }

    const updatedPayment = await this.paymentRepository.update(id, {
      status: 'cancelled',
      notes: reason || existingPayment.notes,
    });

    if (!updatedPayment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return updatedPayment;
  }

  async refundPayment(id: string, reason?: string): Promise<Payment> {
    const existingPayment = await this.findById(id);

    if (existingPayment.status !== 'completed') {
      throw new BadRequestException('Can only refund completed payments');
    }

    const updatedPayment = await this.paymentRepository.update(id, {
      status: 'refunded',
      notes: reason || existingPayment.notes,
    });

    if (!updatedPayment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return updatedPayment;
  }

  async delete(id: string): Promise<void> {
    const existingPayment = await this.findById(id);

    // Delete proof from S3 if exists
    if (existingPayment.proofUrl) {
      await this.s3Service.deleteFileByUrl(existingPayment.proofUrl);
    }

    const deleted = await this.paymentRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
  }

  async getPaymentStats(cartId: string) {
    return await this.paymentRepository.getPaymentStats(cartId);
  }

  /**
   * Create a proof-based payment (check or transfer)
   */
  async createProofPayment(
    createProofPaymentDto: CreateProofPaymentDto,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.create({
      cartId: createProofPaymentDto.cartId,
      paymentMethodId: createProofPaymentDto.paymentMethodId,
      amount: createProofPaymentDto.amount.toString(),
      status: 'processing', // Proof-based payments start in processing status
      proofUrl: createProofPaymentDto.proofUrl,
      externalReference: createProofPaymentDto.externalReference,
      notes: createProofPaymentDto.notes,
    });

    return payment;
  }

  /**
   * Validate payment proof (for check or transfer)
   */
  async validateProof(
    id: string,
    validateProofDto: ValidateProofDto,
  ): Promise<Payment> {
    const existingPayment = await this.findById(id);

    if (!existingPayment.proofUrl) {
      throw new BadRequestException('Payment does not have a proof to validate');
    }

    if (validateProofDto.isValid) {
      // If valid, confirm the payment
      const updatedPayment = await this.paymentRepository.update(id, {
        status: 'completed',
        transactionId: validateProofDto.transactionId,
        notes: validateProofDto.notes || existingPayment.notes,
        confirmedAt: new Date(),
        paymentDate: new Date(),
      });

      if (!updatedPayment) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
      }

      return updatedPayment;
    } else {
      // If invalid, mark as failed
      const updatedPayment = await this.paymentRepository.update(id, {
        status: 'failed',
        notes: validateProofDto.notes || existingPayment.notes,
      });

      if (!updatedPayment) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
      }

      return updatedPayment;
    }
  }

  /**
   * Initiate a Webpay payment
   */
  async initiateWebpayPayment(initiateWebpayDto: InitiateWebpayDto): Promise<{
    payment: Payment;
    webpayUrl: string;
    webpayToken: string;
  }> {
    // Create payment record with pending status
    const payment = await this.paymentRepository.create({
      cartId: initiateWebpayDto.cartId,
      paymentMethodId: initiateWebpayDto.metadata?.paymentMethodId,
      amount: initiateWebpayDto.amount.toString(),
      status: 'pending',
      metadata: initiateWebpayDto.metadata,
    });

    // Initiate Webpay transaction
    const webpayResponse =
      await this.webpayService.initiateTransaction(initiateWebpayDto);

    // Update payment with Webpay token
    await this.paymentRepository.update(payment.id, {
      externalReference: webpayResponse.token,
      notes: `Webpay transaction initiated. Token: ${webpayResponse.token}`,
    });

    return {
      payment,
      webpayUrl: webpayResponse.url,
      webpayToken: webpayResponse.token,
    };
  }

  /**
   * Handle Webpay callback
   */
  async handleWebpayCallback(
    webpayCallbackDto: WebpayCallbackDto,
  ): Promise<Payment> {
    // Find payment by external reference (Webpay token)
    const payments = await this.paymentRepository.findAll();
    const payment = payments.find(
      (p) => p.externalReference === webpayCallbackDto.token,
    );

    if (!payment) {
      throw new NotFoundException(
        `Payment with Webpay token ${webpayCallbackDto.token} not found`,
      );
    }

    // Verify transaction with Webpay
    const verificationResult =
      await this.webpayService.verifyTransaction(webpayCallbackDto);

    if (verificationResult.success) {
      // Payment successful - update to completed
      const updatedPayment = await this.paymentRepository.update(payment.id, {
        status: 'completed',
        transactionId: verificationResult.transactionId,
        confirmedAt: new Date(),
        paymentDate: new Date(),
        metadata: {
          ...(payment.metadata as Record<string, any> || {}),
          authorizationCode: verificationResult.authorizationCode,
          webpayStatus: verificationResult.status,
        },
      });

      if (!updatedPayment) {
        throw new NotFoundException(`Payment with ID ${payment.id} not found`);
      }

      return updatedPayment;
    } else {
      // Payment failed
      const updatedPayment = await this.paymentRepository.update(payment.id, {
        status: 'failed',
        notes: `Webpay transaction failed: ${verificationResult.error}`,
      });

      if (!updatedPayment) {
        throw new NotFoundException(`Payment with ID ${payment.id} not found`);
      }

      return updatedPayment;
    }
  }

  private validateStatusTransition(
    currentStatus: PaymentStatus,
    newStatus: PaymentStatus,
  ): void {
    const validTransitions: Record<PaymentStatus, PaymentStatus[]> = {
      pending: ['processing', 'cancelled', 'failed'],
      processing: ['completed', 'failed', 'cancelled'],
      completed: ['refunded'],
      failed: ['pending', 'cancelled'],
      cancelled: ['pending'],
      refunded: [],
    };

    const allowedStatuses = validTransitions[currentStatus] || [];

    if (!allowedStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}

