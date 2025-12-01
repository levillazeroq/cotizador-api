import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { S3Service } from '../s3/s3.service';
import { PdfGeneratorService } from './services/pdf-generator.service';
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
  mockPaymentStats,
  createPaymentRepositoryMock,
} from './__mocks__';

describe('PaymentService', () => {
  let service: PaymentService;
  let repository: jest.Mocked<PaymentRepository>;
  let s3Service: jest.Mocked<S3Service>;
  let pdfGeneratorService: jest.Mocked<PdfGeneratorService>;

  const mockS3Service = {
    uploadFile: jest.fn(),
    deleteFileByUrl: jest.fn(),
  };

  const mockPdfGeneratorService = {
    generatePaymentReceipt: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: PaymentRepository,
          useValue: createPaymentRepositoryMock(),
        },
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
        {
          provide: PdfGeneratorService,
          useValue: mockPdfGeneratorService,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    repository = module.get(PaymentRepository);
    s3Service = module.get(S3Service);
    pdfGeneratorService = module.get(PdfGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a payment', async () => {
      repository.create.mockResolvedValue(mockPayment);

      const result = await service.create(mockCreatePaymentDto);

      expect(result).toEqual(mockPayment);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          cartId: mockCreatePaymentDto.cartId,
          amount: mockCreatePaymentDto.amount.toString(),
          paymentType: mockCreatePaymentDto.paymentType,
          status: 'pending',
        }),
      );
    });

    it('should use default status when not provided', async () => {
      const dtoWithoutStatus = {
        cartId: mockCreatePaymentDto.cartId,
        amount: mockCreatePaymentDto.amount,
        paymentType: mockCreatePaymentDto.paymentType,
      };

      repository.create.mockResolvedValue(mockPayment);

      await service.create(dtoWithoutStatus as any);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'pending',
        }),
      );
    });

    it('should convert paymentDate string to Date', async () => {
      const dtoWithDate = {
        ...mockCreatePaymentDto,
        paymentDate: '2024-01-01T00:00:00Z',
      };

      repository.create.mockResolvedValue(mockPayment);

      await service.create(dtoWithDate);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentDate: expect.any(Date),
        }),
      );
    });

    it('should convert confirmedAt string to Date', async () => {
      const dtoWithDate = {
        ...mockCreatePaymentDto,
        confirmedAt: '2024-01-01T00:00:00Z',
      };

      repository.create.mockResolvedValue(mockPayment);

      await service.create(dtoWithDate);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          confirmedAt: expect.any(Date),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all payments', async () => {
      repository.findAll.mockResolvedValue(mockPayments);

      const result = await service.findAll();

      expect(result).toEqual(mockPayments);
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('findAllPaginated', () => {
    it('should return paginated payments', async () => {
      repository.findAllPaginated.mockResolvedValue(mockPaginatedPayments);

      const filters = { page: 1, limit: 10 };
      const result = await service.findAllPaginated(filters);

      expect(result).toEqual(mockPaginatedPayments);
      expect(repository.findAllPaginated).toHaveBeenCalledWith(filters);
    });
  });

  describe('getGlobalStats', () => {
    it('should return global payment statistics', async () => {
      repository.getGlobalStats.mockResolvedValue(mockGlobalStats as any);

      const result = await service.getGlobalStats();

      expect(result).toBeDefined();
      expect(repository.getGlobalStats).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a payment by id', async () => {
      repository.findById.mockResolvedValue(mockPayment);

      const result = await service.findById(mockPayment.id);

      expect(result).toEqual(mockPayment);
      expect(repository.findById).toHaveBeenCalledWith(mockPayment.id);
    });

    it('should throw NotFoundException when payment not found', async () => {
      repository.findById.mockResolvedValue(undefined);

      await expect(service.findById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByCartId', () => {
    it('should return payments by cart id', async () => {
      repository.findByCartId.mockResolvedValue([mockPayment]);

      const result = await service.findByCartId(mockPayment.cartId);

      expect(result).toEqual([mockPayment]);
      expect(repository.findByCartId).toHaveBeenCalledWith(mockPayment.cartId);
    });
  });

  describe('findByTransactionId', () => {
    it('should return payment by transaction id', async () => {
      repository.findByTransactionId.mockResolvedValue(mockPaymentCompleted);

      const result = await service.findByTransactionId('TXN123456');

      expect(result).toEqual(mockPaymentCompleted);
      expect(repository.findByTransactionId).toHaveBeenCalledWith('TXN123456');
    });

    it('should return null when payment not found', async () => {
      repository.findByTransactionId.mockResolvedValue(undefined);

      const result = await service.findByTransactionId('INVALID');

      expect(result).toBeNull();
    });
  });

  describe('findByStatus', () => {
    it('should return payments by status', async () => {
      repository.findByStatus.mockResolvedValue([mockPaymentCompleted]);

      const result = await service.findByStatus('completed');

      expect(result).toEqual([mockPaymentCompleted]);
      expect(repository.findByStatus).toHaveBeenCalledWith('completed');
    });
  });

  describe('update', () => {
    it('should update a payment', async () => {
      const updatedPayment = { ...mockPayment, ...mockUpdatePaymentDto };

      repository.findById.mockResolvedValue(mockPayment);
      // Ensure updatedPayment.amount is a string for compatibility
      const updatedPaymentStringAmount = {
        ...mockPayment,
        ...mockUpdatePaymentDto,
        amount: String(
          (mockUpdatePaymentDto as any).amount ?? mockPayment.amount
        ),
      };
      repository.update.mockResolvedValue(updatedPaymentStringAmount);

      const result = await service.update(mockPayment.id, mockUpdatePaymentDto);

      expect(result).toEqual(updatedPaymentStringAmount);

      expect(repository.findById).toHaveBeenCalledWith(mockPayment.id);
      expect(repository.update).toHaveBeenCalled();
    });

    it('should convert amount to string', async () => {
      repository.findById.mockResolvedValue(mockPayment);
      repository.update.mockResolvedValue(mockPayment);

      await service.update(mockPayment.id, { amount: 15000 });

      expect(repository.update).toHaveBeenCalledWith(
        mockPayment.id,
        expect.objectContaining({
          amount: '15000',
        }),
      );
    });

    it('should convert paymentDate string to Date', async () => {
      repository.findById.mockResolvedValue(mockPayment);
      repository.update.mockResolvedValue(mockPayment);

      await service.update(mockPayment.id, {
        paymentDate: '2024-01-01T00:00:00Z',
      });

      expect(repository.update).toHaveBeenCalledWith(
        mockPayment.id,
        expect.objectContaining({
          paymentDate: expect.any(Date),
        }),
      );
    });

    it('should throw NotFoundException when payment not found', async () => {
      repository.findById.mockResolvedValue(undefined);

      await expect(
        service.update('invalid-id', mockUpdatePaymentDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when update fails', async () => {
      repository.findById.mockResolvedValue(mockPayment);
      repository.update.mockResolvedValue(undefined);

      await expect(
        service.update(mockPayment.id, mockUpdatePaymentDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update payment status', async () => {
      const updatedPayment = { ...mockPayment, status: 'processing' as const };

      repository.findById.mockResolvedValue(mockPayment);
      repository.updateStatus.mockResolvedValue(updatedPayment);

      const result = await service.updateStatus(mockPayment.id, 'processing');

      expect(result).toEqual(updatedPayment);
      expect(repository.findById).toHaveBeenCalledWith(mockPayment.id);
      expect(repository.updateStatus).toHaveBeenCalledWith(
        mockPayment.id,
        'processing',
      );
    });

    it('should validate status transition', async () => {
      repository.findById.mockResolvedValue(mockPaymentCompleted);

      await expect(
        service.updateStatus(mockPaymentCompleted.id, 'pending'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when payment not found', async () => {
      repository.findById.mockResolvedValue(undefined);

      await expect(
        service.updateStatus('invalid-id', 'processing'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when update fails', async () => {
      repository.findById.mockResolvedValue(mockPayment);
      repository.updateStatus.mockResolvedValue(undefined);

      await expect(
        service.updateStatus(mockPayment.id, 'processing'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('uploadProof', () => {
    it('should upload proof for a payment', async () => {
      const updatedPayment = {
        ...mockPayment,
        proofUrl: mockUploadProofDto.proofUrl,
        notes: mockUploadProofDto.notes,
        status: 'processing' as const,
      };

      repository.findById.mockResolvedValue(mockPayment);
      repository.uploadProof.mockResolvedValue(updatedPayment);
      repository.updateStatus.mockResolvedValue(updatedPayment);

      const result = await service.uploadProof(
        mockPayment.id,
        mockUploadProofDto,
      );

      expect(result).toEqual(updatedPayment);
      expect(repository.findById).toHaveBeenCalledWith(mockPayment.id);
      expect(repository.uploadProof).toHaveBeenCalledWith(
        mockPayment.id,
        mockUploadProofDto.proofUrl,
        mockUploadProofDto.notes,
      );
    });

    it('should update status to processing if payment was pending', async () => {
      repository.findById.mockResolvedValue(mockPayment);
      repository.uploadProof.mockResolvedValue({
        ...mockPayment,
        proofUrl: mockUploadProofDto.proofUrl,
      });
      repository.updateStatus.mockResolvedValue({
        ...mockPayment,
        status: 'processing' as const,
      });

      await service.uploadProof(mockPayment.id, mockUploadProofDto);

      expect(repository.updateStatus).toHaveBeenCalledWith(
        mockPayment.id,
        'processing',
      );
    });

    it('should not update status if payment was not pending', async () => {
      repository.findById.mockResolvedValue(mockPaymentWithProof);
      repository.uploadProof.mockResolvedValue(mockPaymentWithProof);

      await service.uploadProof(mockPaymentWithProof.id, mockUploadProofDto);

      expect(repository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when payment not found', async () => {
      repository.findById.mockResolvedValue(undefined);

      await expect(
        service.uploadProof('invalid-id', mockUploadProofDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('confirmPayment', () => {
    it('should confirm a payment', async () => {
      const confirmedPayment = {
        ...mockPayment,
        status: 'completed' as const,
        transactionId: mockConfirmPaymentDto.transactionId,
        confirmedAt: expect.any(Date),
        paymentDate: expect.any(Date),
      };

      repository.findById.mockResolvedValue(mockPayment);
      repository.update.mockResolvedValue(confirmedPayment);

      const result = await service.confirmPayment(
        mockPayment.id,
        mockConfirmPaymentDto,
      );

      expect(result.status).toBe('completed');
      expect(repository.update).toHaveBeenCalledWith(
        mockPayment.id,
        expect.objectContaining({
          status: 'completed',
          transactionId: mockConfirmPaymentDto.transactionId,
        }),
      );
    });

    it('should throw BadRequestException when payment already confirmed', async () => {
      repository.findById.mockResolvedValue(mockPaymentCompleted);

      await expect(
        service.confirmPayment(mockPaymentCompleted.id, mockConfirmPaymentDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when payment not found', async () => {
      repository.findById.mockResolvedValue(undefined);

      await expect(
        service.confirmPayment('invalid-id', mockConfirmPaymentDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelPayment', () => {
    it('should cancel a payment', async () => {
      const cancelledPayment = {
        ...mockPayment,
        status: 'cancelled' as const,
        notes: 'Cancelled reason',
      };

      repository.findById.mockResolvedValue(mockPayment);
      repository.update.mockResolvedValue(cancelledPayment);

      const result = await service.cancelPayment(
        mockPayment.id,
        'Cancelled reason',
      );

      expect(result.status).toBe('cancelled');
      expect(repository.update).toHaveBeenCalledWith(
        mockPayment.id,
        expect.objectContaining({
          status: 'cancelled',
        }),
      );
    });

    it('should throw BadRequestException when cancelling completed payment', async () => {
      repository.findById.mockResolvedValue(mockPaymentCompleted);

      await expect(
        service.cancelPayment(mockPaymentCompleted.id, 'reason'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when payment not found', async () => {
      repository.findById.mockResolvedValue(undefined);

      await expect(
        service.cancelPayment('invalid-id', 'reason'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('refundPayment', () => {
    it('should refund a completed payment', async () => {
      const refundedPayment = {
        ...mockPaymentCompleted,
        status: 'refunded' as const,
        notes: 'Refund reason',
      };

      repository.findById.mockResolvedValue(mockPaymentCompleted);
      repository.update.mockResolvedValue(refundedPayment);

      const result = await service.refundPayment(
        mockPaymentCompleted.id,
        'Refund reason',
      );

      expect(result.status).toBe('refunded');
      expect(repository.update).toHaveBeenCalledWith(
        mockPaymentCompleted.id,
        expect.objectContaining({
          status: 'refunded',
        }),
      );
    });

    it('should throw BadRequestException when refunding non-completed payment', async () => {
      repository.findById.mockResolvedValue(mockPayment);

      await expect(
        service.refundPayment(mockPayment.id, 'reason'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when payment not found', async () => {
      repository.findById.mockResolvedValue(undefined);

      await expect(
        service.refundPayment('invalid-id', 'reason'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a payment', async () => {
      repository.findById.mockResolvedValue(mockPayment);
      repository.delete.mockResolvedValue(true);
      s3Service.deleteFileByUrl.mockResolvedValue(undefined);

      await service.delete(mockPayment.id);

      expect(repository.findById).toHaveBeenCalledWith(mockPayment.id);
      expect(repository.delete).toHaveBeenCalledWith(mockPayment.id);
    });

    it('should delete proof from S3 if exists', async () => {
      repository.findById.mockResolvedValue(mockPaymentWithProof);
      repository.delete.mockResolvedValue(true);
      s3Service.deleteFileByUrl.mockResolvedValue(undefined);

      await service.delete(mockPaymentWithProof.id);

      expect(s3Service.deleteFileByUrl).toHaveBeenCalledWith(
        mockPaymentWithProof.proofUrl,
      );
    });

    it('should not delete proof from S3 if not exists', async () => {
      repository.findById.mockResolvedValue(mockPayment);
      repository.delete.mockResolvedValue(true);

      await service.delete(mockPayment.id);

      expect(s3Service.deleteFileByUrl).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when payment not found', async () => {
      repository.findById.mockResolvedValue(undefined);

      await expect(service.delete('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when delete fails', async () => {
      repository.findById.mockResolvedValue(mockPayment);
      repository.delete.mockResolvedValue(false);

      await expect(service.delete(mockPayment.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPaymentStats', () => {
    it('should return payment statistics for a cart', async () => {
      repository.getPaymentStats.mockResolvedValue(mockPaymentStats);

      const result = await service.getPaymentStats(mockPayment.cartId);

      expect(result).toEqual(mockPaymentStats);
      expect(repository.getPaymentStats).toHaveBeenCalledWith(
        mockPayment.cartId,
      );
    });
  });

  describe('createProofPayment', () => {
    it('should create proof payment with file upload', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'proof.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 1024,
      } as Express.Multer.File;

      const uploadResult = {
        success: true,
        url: 'https://s3.example.com/proof.jpg',
      };

      s3Service.uploadFile.mockResolvedValue(uploadResult);
      repository.create.mockResolvedValue(mockPaymentWithProof);

      const result = await service.createProofPayment(
        mockCreateProofPaymentDto,
        mockFile,
      );

      expect(result).toEqual(mockPaymentWithProof);
      expect(s3Service.uploadFile).toHaveBeenCalled();
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'processing',
          proofUrl: uploadResult.url,
        }),
      );
    });

    it('should create proof payment with provided URL', async () => {
      repository.create.mockResolvedValue(mockPaymentWithProof);

      const result = await service.createProofPayment(
        mockCreateProofPaymentDto,
      );

      expect(result).toEqual(mockPaymentWithProof);
      expect(s3Service.uploadFile).not.toHaveBeenCalled();
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          proofUrl: mockCreateProofPaymentDto.proofUrl,
        }),
      );
    });

    it('should throw BadRequestException for non-image file', async () => {
      const mockFile = {
        mimetype: 'application/pdf',
        size: 1024,
      } as Express.Multer.File;

      await expect(
        service.createProofPayment(mockCreateProofPaymentDto, mockFile),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for file too large', async () => {
      const mockFile = {
        mimetype: 'image/jpeg',
        size: 6 * 1024 * 1024, // 6MB
      } as Express.Multer.File;

      await expect(
        service.createProofPayment(mockCreateProofPaymentDto, mockFile),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when no proof URL or file provided', async () => {
      const dtoWithoutProof = {
        cartId: mockCreateProofPaymentDto.cartId,
        paymentType: mockCreateProofPaymentDto.paymentType,
        amount: mockCreateProofPaymentDto.amount,
      };

      await expect(
        service.createProofPayment(dtoWithoutProof as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when upload fails', async () => {
      const mockFile = {
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('test'),
        originalname: 'proof.jpg',
      } as Express.Multer.File;

      s3Service.uploadFile.mockResolvedValue({
        success: false,
        error: 'Upload failed',
      });

      await expect(
        service.createProofPayment(mockCreateProofPaymentDto, mockFile),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateProof', () => {
    it('should validate proof and confirm payment when valid', async () => {
      const validatedPayment = {
        ...mockPaymentWithProof,
        status: 'completed' as const,
        transactionId: mockValidateProofDto.transactionId,
        confirmedAt: expect.any(Date),
        paymentDate: expect.any(Date),
      };

      repository.findById.mockResolvedValue(mockPaymentWithProof);
      repository.update.mockResolvedValue(validatedPayment);

      const result = await service.validateProof(
        mockPaymentWithProof.id,
        mockValidateProofDto,
      );

      expect(result.status).toBe('completed');
      expect(repository.update).toHaveBeenCalledWith(
        mockPaymentWithProof.id,
        expect.objectContaining({
          status: 'completed',
        }),
      );
    });

    it('should mark payment as failed when proof is invalid', async () => {
      const invalidDto = { ...mockValidateProofDto, isValid: false };
      const failedPayment = {
        ...mockPaymentWithProof,
        status: 'failed' as const,
      };

      repository.findById.mockResolvedValue(mockPaymentWithProof);
      repository.update.mockResolvedValue(failedPayment);

      const result = await service.validateProof(
        mockPaymentWithProof.id,
        invalidDto,
      );

      expect(result.status).toBe('failed');
      expect(repository.update).toHaveBeenCalledWith(
        mockPaymentWithProof.id,
        expect.objectContaining({
          status: 'failed',
        }),
      );
    });

    it('should throw BadRequestException when payment has no proof', async () => {
      repository.findById.mockResolvedValue(mockPayment);

      await expect(
        service.validateProof(mockPayment.id, mockValidateProofDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when payment not found', async () => {
      repository.findById.mockResolvedValue(undefined);

      await expect(
        service.validateProof('invalid-id', mockValidateProofDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateReceipt', () => {
    it('should generate payment receipt PDF', async () => {
      const mockPdfBuffer = Buffer.from('PDF content');

      repository.findById.mockResolvedValue(mockPaymentCompleted);
      pdfGeneratorService.generatePaymentReceipt.mockResolvedValue(
        mockPdfBuffer,
      );

      const result = await service.generateReceipt(mockPaymentCompleted.id);

      expect(result).toEqual(mockPdfBuffer);
      expect(pdfGeneratorService.generatePaymentReceipt).toHaveBeenCalledWith(
        mockPaymentCompleted,
      );
    });

    it('should throw NotFoundException when payment not found', async () => {
      repository.findById.mockResolvedValue(undefined);

      await expect(service.generateReceipt('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
