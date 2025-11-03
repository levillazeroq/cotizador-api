import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { UploadProofDto } from './dto/upload-proof.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CreateProofPaymentDto } from './dto/create-proof-payment.dto';
import { InitiateWebpayDto } from './dto/initiate-webpay.dto';
import { WebpayCallbackDto } from './dto/webpay-callback.dto';
import { ValidateProofDto } from './dto/validate-proof.dto';
import { PaymentStatus } from '../database/schemas';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return await this.paymentService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'] })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async findAll(@Query('status') status?: PaymentStatus) {
    if (status) {
      return await this.paymentService.findByStatus(status);
    }
    return await this.paymentService.findAll();
  }

  @Get('cart/:cartId')
  @ApiOperation({ summary: 'Get all payments for a cart' })
  @ApiParam({ name: 'cartId', description: 'Cart ID' })
  @ApiResponse({ status: 200, description: 'Cart payments retrieved successfully' })
  async findByCartId(@Param('cartId') cartId: string) {
    return await this.paymentService.findByCartId(cartId);
  }

  @Get('cart/:cartId/stats')
  @ApiOperation({ summary: 'Get payment statistics for a cart' })
  @ApiParam({ name: 'cartId', description: 'Cart ID' })
  @ApiResponse({ status: 200, description: 'Payment stats retrieved successfully' })
  async getCartPaymentStats(@Param('cartId') cartId: string) {
    return await this.paymentService.getPaymentStats(cartId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async findOne(@Param('id') id: string) {
    return await this.paymentService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return await this.paymentService.update(id, updatePaymentDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update payment status' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: PaymentStatus,
  ) {
    return await this.paymentService.updateStatus(id, status);
  }

  @Patch(':id/upload-proof')
  @ApiOperation({ summary: 'Upload payment proof' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment proof uploaded successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async uploadProof(
    @Param('id') id: string,
    @Body() uploadProofDto: UploadProofDto,
  ) {
    return await this.paymentService.uploadProof(id, uploadProofDto);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Payment already confirmed' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async confirmPayment(
    @Param('id') id: string,
    @Body() confirmPaymentDto: ConfirmPaymentDto,
  ) {
    return await this.paymentService.confirmPayment(id, confirmPaymentDto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel completed payment' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async cancelPayment(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return await this.paymentService.cancelPayment(id, reason);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully' })
  @ApiResponse({ status: 400, description: 'Can only refund completed payments' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async refundPayment(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return await this.paymentService.refundPayment(id, reason);
  }

  @Post('proof')
  @ApiOperation({ summary: 'Create a proof-based payment (check or transfer)' })
  @ApiResponse({ status: 201, description: 'Proof payment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createProofPayment(@Body() createProofPaymentDto: CreateProofPaymentDto) {
    return await this.paymentService.createProofPayment(createProofPaymentDto);
  }

  @Patch(':id/validate-proof')
  @ApiOperation({ summary: 'Validate payment proof (admin only)' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment proof validated successfully' })
  @ApiResponse({ status: 400, description: 'Payment does not have a proof' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async validateProof(
    @Param('id') id: string,
    @Body() validateProofDto: ValidateProofDto,
  ) {
    return await this.paymentService.validateProof(id, validateProofDto);
  }

  @Post('webpay/initiate')
  @ApiOperation({ summary: 'Initiate a Webpay payment' })
  @ApiResponse({
    status: 201,
    description: 'Webpay payment initiated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async initiateWebpayPayment(@Body() initiateWebpayDto: InitiateWebpayDto) {
    return await this.paymentService.initiateWebpayPayment(initiateWebpayDto);
  }

  @Post('webpay/callback')
  @ApiOperation({ summary: 'Handle Webpay callback' })
  @ApiResponse({ status: 200, description: 'Webpay callback processed successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async handleWebpayCallback(@Body() webpayCallbackDto: WebpayCallbackDto) {
    return await this.paymentService.handleWebpayCallback(webpayCallbackDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 204, description: 'Payment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async delete(@Param('id') id: string) {
    await this.paymentService.delete(id);
  }
}

