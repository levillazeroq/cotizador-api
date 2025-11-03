import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { S3Service } from '../s3/s3.service';
import { WebpayService } from './webpay.service';

describe('PaymentService', () => {
  let service: PaymentService;
  let repository: PaymentRepository;
  let s3Service: S3Service;
  let webpayService: WebpayService;

  const mockPayment = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    cartId: '123e4567-e89b-12d3-a456-426614174001',
    paymentMethodId: '123e4567-e89b-12d3-a456-426614174002',
    amount: '100.00',
    status: 'pending' as const,
    proofUrl: null,
    transactionId: null,
    externalReference: null,
    paymentDate: null,
    confirmedAt: null,
    metadata: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: PaymentRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByCartId: jest.fn(),
            findByStatus: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            updateStatus: jest.fn(),
            uploadProof: jest.fn(),
            delete: jest.fn(),
            getPaymentStats: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            deleteFileByUrl: jest.fn(),
          },
        },
        {
          provide: WebpayService,
          useValue: {
            initiateTransaction: jest.fn(),
            verifyTransaction: jest.fn(),
            confirmTransaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    repository = module.get<PaymentRepository>(PaymentRepository);
    s3Service = module.get<S3Service>(S3Service);
    webpayService = module.get<WebpayService>(WebpayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a payment', async () => {
      const createDto = {
        cartId: mockPayment.cartId,
        paymentMethodId: mockPayment.paymentMethodId,
        amount: 100,
      };

      jest.spyOn(repository, 'create').mockResolvedValue(mockPayment);

      const result = await service.create(createDto);

      expect(result).toEqual(mockPayment);
      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        amount: '100',
        status: 'pending',
      });
    });
  });

  describe('findById', () => {
    it('should return a payment if found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockPayment);

      const result = await service.findById(mockPayment.id);

      expect(result).toEqual(mockPayment);
    });

    it('should throw NotFoundException if payment not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(undefined);

      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update payment status', async () => {
      const updatedPayment = { ...mockPayment, status: 'completed' as const };

      jest.spyOn(repository, 'findById').mockResolvedValue(mockPayment);
      jest.spyOn(repository, 'updateStatus').mockResolvedValue(updatedPayment);

      const result = await service.updateStatus(mockPayment.id, 'processing');

      expect(result.status).toBe('completed');
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockPayment);

      await expect(
        service.updateStatus(mockPayment.id, 'refunded'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createProofPayment', () => {
    it('should create a proof-based payment', async () => {
      const createDto = {
        cartId: mockPayment.cartId,
        paymentMethodId: mockPayment.paymentMethodId,
        amount: 100,
        proofUrl: 'https://example.com/proof.jpg',
      };

      const proofPayment = {
        ...mockPayment,
        status: 'processing' as const,
        proofUrl: createDto.proofUrl,
      };

      jest.spyOn(repository, 'create').mockResolvedValue(proofPayment);

      const result = await service.createProofPayment(createDto);

      expect(result.status).toBe('processing');
      expect(result.proofUrl).toBe(createDto.proofUrl);
    });
  });

  describe('validateProof', () => {
    it('should mark payment as completed if proof is valid', async () => {
      const paymentWithProof = {
        ...mockPayment,
        proofUrl: 'https://example.com/proof.jpg',
      };
      const completedPayment = {
        ...paymentWithProof,
        status: 'completed' as const,
      };

      jest.spyOn(repository, 'findById').mockResolvedValue(paymentWithProof);
      jest.spyOn(repository, 'update').mockResolvedValue(completedPayment);

      const result = await service.validateProof(mockPayment.id, {
        isValid: true,
      });

      expect(result.status).toBe('completed');
    });

    it('should mark payment as failed if proof is invalid', async () => {
      const paymentWithProof = {
        ...mockPayment,
        proofUrl: 'https://example.com/proof.jpg',
      };
      const failedPayment = { ...paymentWithProof, status: 'failed' as const };

      jest.spyOn(repository, 'findById').mockResolvedValue(paymentWithProof);
      jest.spyOn(repository, 'update').mockResolvedValue(failedPayment);

      const result = await service.validateProof(mockPayment.id, {
        isValid: false,
      });

      expect(result.status).toBe('failed');
    });
  });

  describe('delete', () => {
    it('should delete payment and associated proof', async () => {
      const paymentWithProof = {
        ...mockPayment,
        proofUrl: 'https://example.com/proof.jpg',
      };

      jest.spyOn(repository, 'findById').mockResolvedValue(paymentWithProof);
      jest.spyOn(repository, 'delete').mockResolvedValue(true);
      jest.spyOn(s3Service, 'deleteFileByUrl').mockResolvedValue({
        success: true,
      });

      await service.delete(mockPayment.id);

      expect(s3Service.deleteFileByUrl).toHaveBeenCalledWith(
        paymentWithProof.proofUrl,
      );
      expect(repository.delete).toHaveBeenCalledWith(mockPayment.id);
    });
  });
});

