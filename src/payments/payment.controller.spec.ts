import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import {
  mockPayment,
  mockPaymentCompleted,
  mockPaymentWithProof,
  mockPayments,
  mockCreatePaymentDto,
  mockUpdatePaymentDto,
  mockUploadProofDto,
  mockConfirmPaymentDto,
  mockCreateProofPaymentDto,
  mockValidateProofDto,
  mockPaginatedPayments,
  mockGlobalStats,
} from './__mocks__';

describe('PaymentController', () => {
  let controller: PaymentController;
  let service: jest.Mocked<PaymentService>;

  const mockPaymentService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllPaginated: jest.fn(),
    getGlobalStats: jest.fn(),
    findById: jest.fn(),
    findByCartId: jest.fn(),
    findByTransactionId: jest.fn(),
    findByStatus: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    uploadProof: jest.fn(),
    confirmPayment: jest.fn(),
    cancelPayment: jest.fn(),
    refundPayment: jest.fn(),
    delete: jest.fn(),
    getPaymentStats: jest.fn(),
    createProofPayment: jest.fn(),
    validateProof: jest.fn(),
    generateReceipt: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    service = module.get(PaymentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a payment', async () => {
      service.create.mockResolvedValue(mockPayment);

      const result = await controller.create(mockCreatePaymentDto);

      expect(result).toEqual(mockPayment);
      expect(service.create).toHaveBeenCalledWith(mockCreatePaymentDto);
    });
  });

  describe('getStats', () => {
    it('should return global payment statistics', async () => {
      service.getGlobalStats.mockResolvedValue(mockGlobalStats as any);

      const result = await controller.getStats();

      expect(result).toEqual(mockGlobalStats);
      expect(service.getGlobalStats).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated payments', async () => {
      service.findAllPaginated.mockResolvedValue(mockPaginatedPayments);

      const filters = { page: 1, limit: 10 };
      const result = await controller.findAll(filters);

      expect(result).toEqual(mockPaginatedPayments);
      expect(service.findAllPaginated).toHaveBeenCalledWith(filters);
    });
  });

  describe('findByCartId', () => {
    it('should return completed payment if exists', async () => {
      const payments = [mockPayment, mockPaymentCompleted];
      service.findByCartId.mockResolvedValue(payments);

      const result = await controller.findByCartId(mockPayment.cartId);

      expect(result).toEqual(mockPaymentCompleted);
      expect(service.findByCartId).toHaveBeenCalledWith(mockPayment.cartId);
    });

    it('should return first payment if no completed payment', async () => {
      service.findByCartId.mockResolvedValue([mockPayment]);

      const result = await controller.findByCartId(mockPayment.cartId);

      expect(result).toEqual(mockPayment);
    });

    it('should return null if no payments found', async () => {
      service.findByCartId.mockResolvedValue([]);

      const result = await controller.findByCartId('invalid-cart-id');

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a payment by id', async () => {
      service.findById.mockResolvedValue(mockPayment);

      const result = await controller.findOne(mockPayment.id);

      expect(result).toEqual(mockPayment);
      expect(service.findById).toHaveBeenCalledWith(mockPayment.id);
    });

    it('should throw NotFoundException when payment not found', async () => {
      service.findById.mockRejectedValue(
        new NotFoundException('Payment not found'),
      );

      await expect(controller.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('downloadReceipt', () => {
    it('should download payment receipt as PDF', async () => {
      const mockPdfBuffer = Buffer.from('PDF content');
      const mockResponse = {
        set: jest.fn().mockReturnThis(),
        end: jest.fn(),
      } as any;

      service.generateReceipt.mockResolvedValue(mockPdfBuffer);

      await controller.downloadReceipt(mockPaymentCompleted.id, mockResponse);

      expect(service.generateReceipt).toHaveBeenCalledWith(
        mockPaymentCompleted.id,
      );
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="comprobante-${mockPaymentCompleted.id}.pdf"`,
        'Content-Length': mockPdfBuffer.length,
      });
      expect(mockResponse.end).toHaveBeenCalledWith(mockPdfBuffer);
    });

    it('should throw NotFoundException when payment not found', async () => {
      const mockResponse = {
        set: jest.fn().mockReturnThis(),
        end: jest.fn(),
      } as any;

      service.generateReceipt.mockRejectedValue(
        new NotFoundException('Payment not found'),
      );

      await expect(
        controller.downloadReceipt('invalid-id', mockResponse),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a payment', async () => {
      // Fix to match expected type: ensure 'amount' is a string if required by the contract
      const updatedPayment = {
        ...mockPayment,
        ...mockUpdatePaymentDto,
        amount: String(mockUpdatePaymentDto.amount ?? mockPayment.amount),
      };
      service.update.mockResolvedValue(updatedPayment);

      const result = await controller.update(
        mockPayment.id,
        mockUpdatePaymentDto,
      );

      expect(result).toEqual(updatedPayment);
      expect(service.update).toHaveBeenCalledWith(
        mockPayment.id,
        mockUpdatePaymentDto,
      );
    });

    it('should throw NotFoundException when payment not found', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('Payment not found'),
      );

      await expect(
        controller.update('invalid-id', mockUpdatePaymentDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update payment status', async () => {
      const updatedPayment = { ...mockPayment, status: 'processing' as const };
      service.updateStatus.mockResolvedValue(updatedPayment);

      const result = await controller.updateStatus(
        mockPayment.id,
        'processing',
      );

      expect(result).toEqual(updatedPayment);
      expect(service.updateStatus).toHaveBeenCalledWith(
        mockPayment.id,
        'processing',
      );
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      service.updateStatus.mockRejectedValue(
        new BadRequestException('Invalid status transition'),
      );

      await expect(
        controller.updateStatus(mockPaymentCompleted.id, 'pending'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('uploadProof', () => {
    it('should upload payment proof', async () => {
      const updatedPayment = {
        ...mockPayment,
        proofUrl: mockUploadProofDto.proofUrl,
        status: 'processing' as const,
      };
      service.uploadProof.mockResolvedValue(updatedPayment);

      const result = await controller.uploadProof(
        mockPayment.id,
        mockUploadProofDto,
      );

      expect(result).toEqual(updatedPayment);
      expect(service.uploadProof).toHaveBeenCalledWith(
        mockPayment.id,
        mockUploadProofDto,
      );
    });
  });

  describe('confirmPayment', () => {
    it('should confirm a payment', async () => {
      const confirmedPayment = {
        ...mockPayment,
        status: 'completed' as const,
      };
      service.confirmPayment.mockResolvedValue(confirmedPayment);

      const result = await controller.confirmPayment(
        mockPayment.id,
        mockConfirmPaymentDto,
      );

      expect(result).toEqual(confirmedPayment);
      expect(service.confirmPayment).toHaveBeenCalledWith(
        mockPayment.id,
        mockConfirmPaymentDto,
      );
    });

    it('should throw BadRequestException when payment already confirmed', async () => {
      service.confirmPayment.mockRejectedValue(
        new BadRequestException('Payment already confirmed'),
      );

      await expect(
        controller.confirmPayment(
          mockPaymentCompleted.id,
          mockConfirmPaymentDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelPayment', () => {
    it('should cancel a payment', async () => {
      const cancelledPayment = {
        ...mockPayment,
        status: 'cancelled' as const,
      };
      service.cancelPayment.mockResolvedValue(cancelledPayment);

      const result = await controller.cancelPayment(mockPayment.id, 'Reason');

      expect(result).toEqual(cancelledPayment);
      expect(service.cancelPayment).toHaveBeenCalledWith(
        mockPayment.id,
        'Reason',
      );
    });

    it('should cancel payment without reason', async () => {
      const cancelledPayment = {
        ...mockPayment,
        status: 'cancelled' as const,
      };
      service.cancelPayment.mockResolvedValue(cancelledPayment);

      await controller.cancelPayment(mockPayment.id);

      expect(service.cancelPayment).toHaveBeenCalledWith(
        mockPayment.id,
        undefined,
      );
    });

    it('should throw BadRequestException when cancelling completed payment', async () => {
      service.cancelPayment.mockRejectedValue(
        new BadRequestException('Cannot cancel completed payment'),
      );

      await expect(
        controller.cancelPayment(mockPaymentCompleted.id, 'Reason'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('refundPayment', () => {
    it('should refund a payment', async () => {
      const refundedPayment = {
        ...mockPaymentCompleted,
        status: 'refunded' as const,
      };
      service.refundPayment.mockResolvedValue(refundedPayment);

      const result = await controller.refundPayment(
        mockPaymentCompleted.id,
        'Refund reason',
      );

      expect(result).toEqual(refundedPayment);
      expect(service.refundPayment).toHaveBeenCalledWith(
        mockPaymentCompleted.id,
        'Refund reason',
      );
    });

    it('should refund payment without reason', async () => {
      const refundedPayment = {
        ...mockPaymentCompleted,
        status: 'refunded' as const,
      };
      service.refundPayment.mockResolvedValue(refundedPayment);

      await controller.refundPayment(mockPaymentCompleted.id);

      expect(service.refundPayment).toHaveBeenCalledWith(
        mockPaymentCompleted.id,
        undefined,
      );
    });

    it('should throw BadRequestException when refunding non-completed payment', async () => {
      service.refundPayment.mockRejectedValue(
        new BadRequestException('Can only refund completed payments'),
      );

      await expect(
        controller.refundPayment(mockPayment.id, 'Reason'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createProofPayment', () => {
    it('should create proof payment with file', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'proof.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 1024,
      } as Express.Multer.File;

      service.createProofPayment.mockResolvedValue(mockPaymentWithProof);

      const result = await controller.createProofPayment(
        mockCreateProofPaymentDto,
        mockFile,
      );

      expect(result).toEqual(mockPaymentWithProof);
      expect(service.createProofPayment).toHaveBeenCalledWith(
        mockCreateProofPaymentDto,
        mockFile,
      );
    });

    it('should create proof payment without file', async () => {
      service.createProofPayment.mockResolvedValue(mockPaymentWithProof);

      const result = await controller.createProofPayment(
        mockCreateProofPaymentDto,
      );

      expect(result).toEqual(mockPaymentWithProof);
      expect(service.createProofPayment).toHaveBeenCalledWith(
        mockCreateProofPaymentDto,
        undefined,
      );
    });

    it('should throw BadRequestException for invalid file', async () => {
      const mockFile = {
        mimetype: 'application/pdf',
        size: 1024,
      } as Express.Multer.File;

      service.createProofPayment.mockRejectedValue(
        new BadRequestException('Only image files are allowed'),
      );

      await expect(
        controller.createProofPayment(mockCreateProofPaymentDto, mockFile),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateProof', () => {
    it('should validate proof and confirm payment when valid', async () => {
      const validatedPayment = {
        ...mockPaymentWithProof,
        status: 'completed' as const,
      };
      service.validateProof.mockResolvedValue(validatedPayment);

      const result = await controller.validateProof(
        mockPaymentWithProof.id,
        mockValidateProofDto,
      );

      expect(result).toEqual(validatedPayment);
      expect(service.validateProof).toHaveBeenCalledWith(
        mockPaymentWithProof.id,
        mockValidateProofDto,
      );
    });

    it('should mark payment as failed when proof is invalid', async () => {
      const invalidDto = { ...mockValidateProofDto, isValid: false };
      const failedPayment = {
        ...mockPaymentWithProof,
        status: 'failed' as const,
      };
      service.validateProof.mockResolvedValue(failedPayment);

      const result = await controller.validateProof(
        mockPaymentWithProof.id,
        invalidDto,
      );

      expect(result.status).toBe('failed');
    });

    it('should throw BadRequestException when payment has no proof', async () => {
      service.validateProof.mockRejectedValue(
        new BadRequestException('Payment does not have a proof'),
      );

      await expect(
        controller.validateProof(mockPayment.id, mockValidateProofDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete a payment', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.delete(mockPayment.id);

      expect(service.delete).toHaveBeenCalledWith(mockPayment.id);
    });

    it('should throw NotFoundException when payment not found', async () => {
      service.delete.mockRejectedValue(
        new NotFoundException('Payment not found'),
      );

      await expect(controller.delete('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
