import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { OrganizationPaymentMethodService } from './organization-payment-method.service';
import { OrganizationPaymentMethodRepository } from './organization-payment-method.repository';
import { OrganizationRepository } from './organization.repository';
import {
  mockOrganizationPaymentMethod,
  mockOrganizationPaymentMethod2,
  mockCreateOrganizationPaymentMethodDto,
  mockUpdateOrganizationPaymentMethodDto,
  mockCreateOrganizationPaymentMethodDtoMinimal,
  mockUpdateOrganizationPaymentMethodDtoPartial,
} from './__mocks__/organization-payment-method.mocks';
import { createOrganizationPaymentMethodRepositoryMock } from './__mocks__/organization-payment-method-repository.mocks';
import { mockOrganization } from './__mocks__/organization.mocks';
import { createOrganizationRepositoryMock } from './__mocks__/organization-repository.mocks';

describe('OrganizationPaymentMethodService', () => {
  let service: OrganizationPaymentMethodService;
  let paymentMethodRepository: jest.Mocked<OrganizationPaymentMethodRepository>;
  let organizationRepository: jest.Mocked<OrganizationRepository>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationPaymentMethodService,
        {
          provide: OrganizationPaymentMethodRepository,
          useValue: createOrganizationPaymentMethodRepositoryMock(),
        },
        {
          provide: OrganizationRepository,
          useValue: createOrganizationRepositoryMock(),
        },
      ],
    }).compile();

    service = module.get<OrganizationPaymentMethodService>(
      OrganizationPaymentMethodService,
    );
    paymentMethodRepository = module.get(OrganizationPaymentMethodRepository);
    organizationRepository = module.get(OrganizationRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new organization payment method', async () => {
      organizationRepository.findById.mockResolvedValue(mockOrganization);
      paymentMethodRepository.findByOrganizationId.mockResolvedValue(null);
      paymentMethodRepository.create.mockResolvedValue(
        mockOrganizationPaymentMethod,
      );

      const result = await service.create(mockCreateOrganizationPaymentMethodDto);

      expect(result).toEqual(mockOrganizationPaymentMethod);
      expect(organizationRepository.findById).toHaveBeenCalledWith(
        mockCreateOrganizationPaymentMethodDto.organizationId,
      );
      expect(paymentMethodRepository.findByOrganizationId).toHaveBeenCalledWith(
        mockCreateOrganizationPaymentMethodDto.organizationId,
      );
      expect(paymentMethodRepository.create).toHaveBeenCalledWith({
        organizationId: mockCreateOrganizationPaymentMethodDto.organizationId,
        isCheckActive: false,
        isWebPayActive: true,
        isBankTransferActive: false,
      });
    });

    it('should use default values when optional fields are not provided', async () => {
      organizationRepository.findById.mockResolvedValue(mockOrganization);
      paymentMethodRepository.findByOrganizationId.mockResolvedValue(null);
      paymentMethodRepository.create.mockResolvedValue(
        mockOrganizationPaymentMethod,
      );

      await service.create(mockCreateOrganizationPaymentMethodDtoMinimal);

      expect(paymentMethodRepository.create).toHaveBeenCalledWith({
        organizationId: mockCreateOrganizationPaymentMethodDtoMinimal.organizationId,
        isCheckActive: false,
        isWebPayActive: false,
        isBankTransferActive: false,
      });
    });

    it('should throw NotFoundException when organization does not exist', async () => {
      organizationRepository.findById.mockResolvedValue(null);

      await expect(
        service.create(mockCreateOrganizationPaymentMethodDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.create(mockCreateOrganizationPaymentMethodDto),
      ).rejects.toThrow(
        `Organization with ID ${mockCreateOrganizationPaymentMethodDto.organizationId} not found`,
      );
      expect(paymentMethodRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when payment methods already exist', async () => {
      organizationRepository.findById.mockResolvedValue(mockOrganization);
      paymentMethodRepository.findByOrganizationId.mockResolvedValue(
        mockOrganizationPaymentMethod,
      );

      await expect(
        service.create(mockCreateOrganizationPaymentMethodDto),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.create(mockCreateOrganizationPaymentMethodDto),
      ).rejects.toThrow(
        `Payment methods already exist for organization ID ${mockCreateOrganizationPaymentMethodDto.organizationId}`,
      );
      expect(paymentMethodRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all organization payment methods', async () => {
      const mockPaymentMethods = [
        mockOrganizationPaymentMethod,
        mockOrganizationPaymentMethod2,
      ];
      paymentMethodRepository.findAll.mockResolvedValue(mockPaymentMethods);

      const result = await service.findAll();

      expect(result).toEqual(mockPaymentMethods);
      expect(paymentMethodRepository.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no payment methods exist', async () => {
      paymentMethodRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(paymentMethodRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an organization payment method by id', async () => {
      paymentMethodRepository.findById.mockResolvedValue(
        mockOrganizationPaymentMethod,
      );

      const result = await service.findOne(1);

      expect(result).toEqual(mockOrganizationPaymentMethod);
      expect(paymentMethodRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when payment method not found', async () => {
      paymentMethodRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Organization payment methods with ID 999 not found',
      );
    });
  });

  describe('findByOrganizationId', () => {
    it('should return payment methods for an organization', async () => {
      paymentMethodRepository.findByOrganizationId.mockResolvedValue(
        mockOrganizationPaymentMethod,
      );

      const result = await service.findByOrganizationId(1);

      expect(result).toEqual(mockOrganizationPaymentMethod);
      expect(paymentMethodRepository.findByOrganizationId).toHaveBeenCalledWith(
        1,
      );
    });

    it('should throw NotFoundException when payment methods not found', async () => {
      paymentMethodRepository.findByOrganizationId.mockResolvedValue(null);

      await expect(service.findByOrganizationId(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByOrganizationId(999)).rejects.toThrow(
        'Payment methods for organization ID 999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update an organization payment method', async () => {
      const updatedPaymentMethod = {
        ...mockOrganizationPaymentMethod,
        ...mockUpdateOrganizationPaymentMethodDto,
      };

      paymentMethodRepository.findById.mockResolvedValue(
        mockOrganizationPaymentMethod,
      );
      paymentMethodRepository.update.mockResolvedValue(updatedPaymentMethod);

      const result = await service.update(1, mockUpdateOrganizationPaymentMethodDto);

      expect(result).toEqual(updatedPaymentMethod);
      expect(paymentMethodRepository.findById).toHaveBeenCalledWith(1);
      expect(paymentMethodRepository.update).toHaveBeenCalledWith(
        1,
        mockUpdateOrganizationPaymentMethodDto,
      );
    });

    it('should allow partial updates', async () => {
      const updatedPaymentMethod = {
        ...mockOrganizationPaymentMethod,
        isWebPayActive: true,
      };

      paymentMethodRepository.findById.mockResolvedValue(
        mockOrganizationPaymentMethod,
      );
      paymentMethodRepository.update.mockResolvedValue(updatedPaymentMethod);

      const result = await service.update(1, mockUpdateOrganizationPaymentMethodDtoPartial);

      expect(result).toEqual(updatedPaymentMethod);
      expect(paymentMethodRepository.update).toHaveBeenCalledWith(
        1,
        mockUpdateOrganizationPaymentMethodDtoPartial,
      );
    });

    it('should throw NotFoundException when payment method not found', async () => {
      paymentMethodRepository.findById.mockResolvedValue(null);

      await expect(
        service.update(999, mockUpdateOrganizationPaymentMethodDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update(999, mockUpdateOrganizationPaymentMethodDto),
      ).rejects.toThrow(
        'Organization payment methods with ID 999 not found',
      );
      expect(paymentMethodRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when update fails', async () => {
      paymentMethodRepository.findById.mockResolvedValue(
        mockOrganizationPaymentMethod,
      );
      paymentMethodRepository.update.mockResolvedValue(null);

      await expect(
        service.update(1, mockUpdateOrganizationPaymentMethodDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update(1, mockUpdateOrganizationPaymentMethodDto),
      ).rejects.toThrow('Failed to update payment methods with ID 1');
    });
  });

  describe('updateByOrganizationId', () => {
    it('should update payment methods by organization id', async () => {
      const updatedPaymentMethod = {
        ...mockOrganizationPaymentMethod,
        ...mockUpdateOrganizationPaymentMethodDto,
      };

      organizationRepository.findById.mockResolvedValue(mockOrganization);
      paymentMethodRepository.findByOrganizationId.mockResolvedValue(
        mockOrganizationPaymentMethod,
      );
      paymentMethodRepository.updateByOrganizationId.mockResolvedValue(
        updatedPaymentMethod,
      );

      const result = await service.updateByOrganizationId(
        1,
        mockUpdateOrganizationPaymentMethodDto,
      );

      expect(result).toEqual(updatedPaymentMethod);
      expect(organizationRepository.findById).toHaveBeenCalledWith(1);
      expect(paymentMethodRepository.findByOrganizationId).toHaveBeenCalledWith(
        1,
      );
      expect(
        paymentMethodRepository.updateByOrganizationId,
      ).toHaveBeenCalledWith(1, mockUpdateOrganizationPaymentMethodDto);
    });

    it('should throw NotFoundException when organization not found', async () => {
      organizationRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateByOrganizationId(999, mockUpdateOrganizationPaymentMethodDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateByOrganizationId(999, mockUpdateOrganizationPaymentMethodDto),
      ).rejects.toThrow('Organization with ID 999 not found');
      expect(paymentMethodRepository.updateByOrganizationId).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when payment methods not found', async () => {
      organizationRepository.findById.mockResolvedValue(mockOrganization);
      paymentMethodRepository.findByOrganizationId.mockResolvedValue(null);

      await expect(
        service.updateByOrganizationId(999, mockUpdateOrganizationPaymentMethodDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateByOrganizationId(999, mockUpdateOrganizationPaymentMethodDto),
      ).rejects.toThrow('Payment methods for organization ID 999 not found');
      expect(paymentMethodRepository.updateByOrganizationId).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when update fails', async () => {
      organizationRepository.findById.mockResolvedValue(mockOrganization);
      paymentMethodRepository.findByOrganizationId.mockResolvedValue(
        mockOrganizationPaymentMethod,
      );
      paymentMethodRepository.updateByOrganizationId.mockResolvedValue(null);

      await expect(
        service.updateByOrganizationId(1, mockUpdateOrganizationPaymentMethodDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateByOrganizationId(1, mockUpdateOrganizationPaymentMethodDto),
      ).rejects.toThrow(
        'Failed to update payment methods for organization ID 1',
      );
    });
  });

  describe('remove', () => {
    it('should delete an organization payment method', async () => {
      paymentMethodRepository.findById.mockResolvedValue(
        mockOrganizationPaymentMethod,
      );
      paymentMethodRepository.delete.mockResolvedValue(true);

      const result = await service.remove(1);

      expect(result).toEqual({
        message: 'Organization payment methods with ID 1 has been deleted',
      });
      expect(paymentMethodRepository.findById).toHaveBeenCalledWith(1);
      expect(paymentMethodRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when payment method not found', async () => {
      paymentMethodRepository.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow(
        'Organization payment methods with ID 999 not found',
      );
      expect(paymentMethodRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when delete fails', async () => {
      paymentMethodRepository.findById.mockResolvedValue(
        mockOrganizationPaymentMethod,
      );
      paymentMethodRepository.delete.mockResolvedValue(false);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
      await expect(service.remove(1)).rejects.toThrow(
        'Failed to delete payment methods with ID 1',
      );
    });
  });

  describe('removeByOrganizationId', () => {
    it('should delete payment methods by organization id', async () => {
      paymentMethodRepository.findByOrganizationId.mockResolvedValue(
        mockOrganizationPaymentMethod,
      );
      paymentMethodRepository.deleteByOrganizationId.mockResolvedValue(true);

      const result = await service.removeByOrganizationId(1);

      expect(result).toEqual({
        message: 'Payment methods for organization ID 1 has been deleted',
      });
      expect(paymentMethodRepository.findByOrganizationId).toHaveBeenCalledWith(
        1,
      );
      expect(paymentMethodRepository.deleteByOrganizationId).toHaveBeenCalledWith(
        1,
      );
    });

    it('should throw NotFoundException when payment methods not found', async () => {
      paymentMethodRepository.findByOrganizationId.mockResolvedValue(null);

      await expect(service.removeByOrganizationId(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.removeByOrganizationId(999)).rejects.toThrow(
        'Payment methods for organization ID 999 not found',
      );
      expect(paymentMethodRepository.deleteByOrganizationId).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when delete fails', async () => {
      paymentMethodRepository.findByOrganizationId.mockResolvedValue(
        mockOrganizationPaymentMethod,
      );
      paymentMethodRepository.deleteByOrganizationId.mockResolvedValue(false);

      await expect(service.removeByOrganizationId(1)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.removeByOrganizationId(1)).rejects.toThrow(
        'Failed to delete payment methods for organization ID 1',
      );
    });
  });
});

