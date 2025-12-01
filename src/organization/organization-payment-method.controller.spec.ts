import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { OrganizationPaymentMethodController } from './organization-payment-method.controller';
import { OrganizationPaymentMethodService } from './organization-payment-method.service';
import {
  mockOrganizationPaymentMethod,
  mockOrganizationPaymentMethod2,
  mockCreateOrganizationPaymentMethodDto,
  mockUpdateOrganizationPaymentMethodDto,
  mockUpdateOrganizationPaymentMethodDtoPartial,
} from './__mocks__/organization-payment-method.mocks';

describe('OrganizationPaymentMethodController', () => {
  let controller: OrganizationPaymentMethodController;
  let service: jest.Mocked<OrganizationPaymentMethodService>;

  const mockOrganizationPaymentMethodService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByOrganizationId: jest.fn(),
    update: jest.fn(),
    updateByOrganizationId: jest.fn(),
    remove: jest.fn(),
    removeByOrganizationId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationPaymentMethodController],
      providers: [
        {
          provide: OrganizationPaymentMethodService,
          useValue: mockOrganizationPaymentMethodService,
        },
      ],
    }).compile();

    controller = module.get<OrganizationPaymentMethodController>(
      OrganizationPaymentMethodController,
    );
    service = module.get(OrganizationPaymentMethodService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new organization payment method', async () => {
      service.create.mockResolvedValue(mockOrganizationPaymentMethod);

      const result = await controller.create(mockCreateOrganizationPaymentMethodDto);

      expect(result).toEqual(mockOrganizationPaymentMethod);
      expect(service.create).toHaveBeenCalledWith(
        mockCreateOrganizationPaymentMethodDto,
      );
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when organization not found', async () => {
      const error = new NotFoundException(
        `Organization with ID ${mockCreateOrganizationPaymentMethodDto.organizationId} not found`,
      );
      service.create.mockRejectedValue(error);

      await expect(
        controller.create(mockCreateOrganizationPaymentMethodDto),
      ).rejects.toThrow(NotFoundException);
      expect(service.create).toHaveBeenCalledWith(
        mockCreateOrganizationPaymentMethodDto,
      );
    });

    it('should throw ConflictException when payment methods already exist', async () => {
      const error = new ConflictException(
        `Payment methods already exist for organization ID ${mockCreateOrganizationPaymentMethodDto.organizationId}`,
      );
      service.create.mockRejectedValue(error);

      await expect(
        controller.create(mockCreateOrganizationPaymentMethodDto),
      ).rejects.toThrow(ConflictException);
      expect(service.create).toHaveBeenCalledWith(
        mockCreateOrganizationPaymentMethodDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return all organization payment methods', async () => {
      const mockPaymentMethods = [
        mockOrganizationPaymentMethod,
        mockOrganizationPaymentMethod2,
      ];
      service.findAll.mockResolvedValue(mockPaymentMethods);

      const result = await controller.findAll();

      expect(result).toEqual(mockPaymentMethods);
      expect(service.findAll).toHaveBeenCalled();
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no payment methods exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an organization payment method by id', async () => {
      service.findOne.mockResolvedValue(mockOrganizationPaymentMethod);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockOrganizationPaymentMethod);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when payment method not found', async () => {
      const error = new NotFoundException(
        'Organization payment methods with ID 999 not found',
      );
      service.findOne.mockRejectedValue(error);

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(controller.findOne(999)).rejects.toThrow(
        'Organization payment methods with ID 999 not found',
      );
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('findByOrganizationId', () => {
    it('should return payment methods for an organization', async () => {
      service.findByOrganizationId.mockResolvedValue(
        mockOrganizationPaymentMethod,
      );

      const result = await controller.findByOrganizationId(1);

      expect(result).toEqual(mockOrganizationPaymentMethod);
      expect(service.findByOrganizationId).toHaveBeenCalledWith(1);
      expect(service.findByOrganizationId).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when payment methods not found', async () => {
      const error = new NotFoundException(
        'Payment methods for organization ID 999 not found',
      );
      service.findByOrganizationId.mockRejectedValue(error);

      await expect(controller.findByOrganizationId(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.findByOrganizationId(999)).rejects.toThrow(
        'Payment methods for organization ID 999 not found',
      );
      expect(service.findByOrganizationId).toHaveBeenCalledWith(999);
    });
  });

  describe('update', () => {
    it('should update an organization payment method', async () => {
      const updatedPaymentMethod = {
        ...mockOrganizationPaymentMethod,
        ...mockUpdateOrganizationPaymentMethodDto,
      };
      service.update.mockResolvedValue(updatedPaymentMethod);

      const result = await controller.update(1, mockUpdateOrganizationPaymentMethodDto);

      expect(result).toEqual(updatedPaymentMethod);
      expect(service.update).toHaveBeenCalledWith(
        1,
        mockUpdateOrganizationPaymentMethodDto,
      );
      expect(service.update).toHaveBeenCalledTimes(1);
    });

    it('should allow partial updates', async () => {
      const updatedPaymentMethod = {
        ...mockOrganizationPaymentMethod,
        ...mockUpdateOrganizationPaymentMethodDtoPartial,
      };
      service.update.mockResolvedValue(updatedPaymentMethod);

      const result = await controller.update(1, mockUpdateOrganizationPaymentMethodDtoPartial);

      expect(result).toEqual(updatedPaymentMethod);
      expect(service.update).toHaveBeenCalledWith(
        1,
        mockUpdateOrganizationPaymentMethodDtoPartial,
      );
    });

    it('should throw NotFoundException when payment method not found', async () => {
      const error = new NotFoundException(
        'Organization payment methods with ID 999 not found',
      );
      service.update.mockRejectedValue(error);

      await expect(
        controller.update(999, mockUpdateOrganizationPaymentMethodDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.update(999, mockUpdateOrganizationPaymentMethodDto),
      ).rejects.toThrow('Organization payment methods with ID 999 not found');
      expect(service.update).toHaveBeenCalledWith(
        999,
        mockUpdateOrganizationPaymentMethodDto,
      );
    });
  });

  describe('updateByOrganizationId', () => {
    it('should update payment methods by organization id', async () => {
      const updatedPaymentMethod = {
        ...mockOrganizationPaymentMethod,
        ...mockUpdateOrganizationPaymentMethodDto,
      };
      service.updateByOrganizationId.mockResolvedValue(updatedPaymentMethod);

      const result = await controller.updateByOrganizationId(
        1,
        mockUpdateOrganizationPaymentMethodDto,
      );

      expect(result).toEqual(updatedPaymentMethod);
      expect(service.updateByOrganizationId).toHaveBeenCalledWith(
        1,
        mockUpdateOrganizationPaymentMethodDto,
      );
      expect(service.updateByOrganizationId).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when organization not found', async () => {
      const error = new NotFoundException('Organization with ID 999 not found');
      service.updateByOrganizationId.mockRejectedValue(error);

      await expect(
        controller.updateByOrganizationId(999, mockUpdateOrganizationPaymentMethodDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.updateByOrganizationId(999, mockUpdateOrganizationPaymentMethodDto),
      ).rejects.toThrow('Organization with ID 999 not found');
      expect(service.updateByOrganizationId).toHaveBeenCalledWith(
        999,
        mockUpdateOrganizationPaymentMethodDto,
      );
    });

    it('should throw NotFoundException when payment methods not found', async () => {
      const error = new NotFoundException(
        'Payment methods for organization ID 999 not found',
      );
      service.updateByOrganizationId.mockRejectedValue(error);

      await expect(
        controller.updateByOrganizationId(999, mockUpdateOrganizationPaymentMethodDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.updateByOrganizationId(999, mockUpdateOrganizationPaymentMethodDto),
      ).rejects.toThrow('Payment methods for organization ID 999 not found');
      expect(service.updateByOrganizationId).toHaveBeenCalledWith(
        999,
        mockUpdateOrganizationPaymentMethodDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete an organization payment method', async () => {
      const deleteResponse = {
        message: 'Organization payment methods with ID 1 has been deleted',
      };
      service.remove.mockResolvedValue(deleteResponse);

      const result = await controller.remove(1);

      expect(result).toEqual(deleteResponse);
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when payment method not found', async () => {
      const error = new NotFoundException(
        'Organization payment methods with ID 999 not found',
      );
      service.remove.mockRejectedValue(error);

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
      await expect(controller.remove(999)).rejects.toThrow(
        'Organization payment methods with ID 999 not found',
      );
      expect(service.remove).toHaveBeenCalledWith(999);
    });
  });

  describe('removeByOrganizationId', () => {
    it('should delete payment methods by organization id', async () => {
      const deleteResponse = {
        message: 'Payment methods for organization ID 1 has been deleted',
      };
      service.removeByOrganizationId.mockResolvedValue(deleteResponse);

      const result = await controller.removeByOrganizationId(1);

      expect(result).toEqual(deleteResponse);
      expect(service.removeByOrganizationId).toHaveBeenCalledWith(1);
      expect(service.removeByOrganizationId).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when payment methods not found', async () => {
      const error = new NotFoundException(
        'Payment methods for organization ID 999 not found',
      );
      service.removeByOrganizationId.mockRejectedValue(error);

      await expect(controller.removeByOrganizationId(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.removeByOrganizationId(999)).rejects.toThrow(
        'Payment methods for organization ID 999 not found',
      );
      expect(service.removeByOrganizationId).toHaveBeenCalledWith(999);
    });
  });
});

