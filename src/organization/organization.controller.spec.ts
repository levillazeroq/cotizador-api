import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import {
  mockOrganization,
  mockOrganizations,
  mockCreateOrganizationDto,
  mockUpdateOrganizationDto,
} from './__mocks__/organization.mocks';

describe('OrganizationController', () => {
  let controller: OrganizationController;
  let service: jest.Mocked<OrganizationService>;

  const mockOrganizationService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByCode: jest.fn(),
    findByStatus: jest.fn(),
    search: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    updateSettings: jest.fn(),
    remove: jest.fn(),
    hardDelete: jest.fn(),
    restore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationController],
      providers: [
        {
          provide: OrganizationService,
          useValue: mockOrganizationService,
        },
      ],
    }).compile();

    controller = module.get<OrganizationController>(OrganizationController);
    service = module.get(OrganizationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an organization', async () => {
      service.create.mockResolvedValue(mockOrganization);

      const result = await controller.create(mockCreateOrganizationDto);

      expect(result).toEqual(mockOrganization);
      expect(service.create).toHaveBeenCalledWith(mockCreateOrganizationDto);
    });

    it('should throw ConflictException when code already exists', async () => {
      service.create.mockRejectedValue(
        new ConflictException('Organization with code already exists'),
      );

      await expect(controller.create(mockCreateOrganizationDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all organizations', async () => {
      service.findAll.mockResolvedValue(mockOrganizations);

      const result = await controller.findAll();

      expect(result).toEqual(mockOrganizations);
      expect(service.findAll).toHaveBeenCalledWith(false);
    });

    it('should include deleted when query param is true', async () => {
      service.findAll.mockResolvedValue(mockOrganizations);

      await controller.findAll('true');

      expect(service.findAll).toHaveBeenCalledWith(true);
    });

    it('should exclude deleted when query param is false', async () => {
      service.findAll.mockResolvedValue(mockOrganizations);

      await controller.findAll('false');

      expect(service.findAll).toHaveBeenCalledWith(false);
    });

    it('should exclude deleted when query param is undefined', async () => {
      service.findAll.mockResolvedValue(mockOrganizations);

      await controller.findAll(undefined);

      expect(service.findAll).toHaveBeenCalledWith(false);
    });
  });

  describe('search', () => {
    it('should search organizations', async () => {
      service.search.mockResolvedValue([mockOrganization]);

      const result = await controller.search('Test');

      expect(result).toEqual([mockOrganization]);
      expect(service.search).toHaveBeenCalledWith('Test');
    });

    it('should throw BadRequestException for empty search term', async () => {
      service.search.mockRejectedValue(
        new BadRequestException('Search term cannot be empty'),
      );

      await expect(controller.search('')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByStatus', () => {
    it('should return organizations by status', async () => {
      const activeOrgs = mockOrganizations.filter((org) => org.status === 'active');
      service.findByStatus.mockResolvedValue(activeOrgs);

      const result = await controller.findByStatus('active');

      expect(result).toEqual(activeOrgs);
      expect(service.findByStatus).toHaveBeenCalledWith('active');
    });

    it('should throw BadRequestException for invalid status', async () => {
      service.findByStatus.mockRejectedValue(
        new BadRequestException('Invalid status'),
      );

      await expect(controller.findByStatus('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByCode', () => {
    it('should return an organization by code', async () => {
      service.findByCode.mockResolvedValue(mockOrganization);

      const result = await controller.findByCode('TEST001');

      expect(result).toEqual(mockOrganization);
      expect(service.findByCode).toHaveBeenCalledWith('TEST001');
    });

    it('should throw NotFoundException when organization not found', async () => {
      service.findByCode.mockRejectedValue(
        new NotFoundException('Organization not found'),
      );

      await expect(controller.findByCode('INVALID')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return an organization by id', async () => {
      service.findOne.mockResolvedValue(mockOrganization);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockOrganization);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when organization not found', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException('Organization not found'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an organization', async () => {
      const updatedOrg = { ...mockOrganization, ...mockUpdateOrganizationDto };
      service.update.mockResolvedValue(updatedOrg);

      const result = await controller.update(1, mockUpdateOrganizationDto);

      expect(result).toEqual(updatedOrg);
      expect(service.update).toHaveBeenCalledWith(1, mockUpdateOrganizationDto);
    });

    it('should throw NotFoundException when organization not found', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('Organization not found'),
      );

      await expect(controller.update(999, mockUpdateOrganizationDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when code already exists', async () => {
      service.update.mockRejectedValue(
        new ConflictException('Organization code already exists'),
      );

      await expect(controller.update(1, { code: 'EXISTING' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update organization status', async () => {
      const updatedOrg = { ...mockOrganization, status: 'inactive' as const };
      service.updateStatus.mockResolvedValue(updatedOrg);

      const result = await controller.updateStatus(1, { status: 'inactive' });

      expect(result).toEqual(updatedOrg);
      expect(service.updateStatus).toHaveBeenCalledWith(1, 'inactive');
    });

    it('should throw NotFoundException when organization not found', async () => {
      service.updateStatus.mockRejectedValue(
        new NotFoundException('Organization not found'),
      );

      await expect(controller.updateStatus(1, { status: 'inactive' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateSettings', () => {
    it('should update organization settings', async () => {
      const newSettings = { theme: 'dark', language: 'en' };
      const updatedOrg = { ...mockOrganization, settings: newSettings };
      service.updateSettings.mockResolvedValue(updatedOrg);

      const result = await controller.updateSettings(1, newSettings);

      expect(result).toEqual(updatedOrg);
      expect(service.updateSettings).toHaveBeenCalledWith(1, newSettings);
    });

    it('should throw NotFoundException when organization not found', async () => {
      service.updateSettings.mockRejectedValue(
        new NotFoundException('Organization not found'),
      );

      await expect(controller.updateSettings(1, {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete an organization', async () => {
      service.remove.mockResolvedValue({
        message: 'Organization with ID 1 has been soft deleted',
      });

      const result = await controller.remove(1);

      expect(result).toEqual({
        message: 'Organization with ID 1 has been soft deleted',
      });
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when organization not found', async () => {
      service.remove.mockRejectedValue(
        new NotFoundException('Organization not found'),
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete an organization', async () => {
      service.hardDelete.mockResolvedValue({
        message: 'Organization with ID 1 has been permanently deleted',
      });

      const result = await controller.hardDelete(1);

      expect(result).toEqual({
        message: 'Organization with ID 1 has been permanently deleted',
      });
      expect(service.hardDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when organization not found', async () => {
      service.hardDelete.mockRejectedValue(
        new NotFoundException('Organization not found'),
      );

      await expect(controller.hardDelete(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('should restore a soft-deleted organization', async () => {
      service.restore.mockResolvedValue(mockOrganization);

      const result = await controller.restore(1);

      expect(result).toEqual(mockOrganization);
      expect(service.restore).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when organization not found', async () => {
      service.restore.mockRejectedValue(
        new NotFoundException('Organization not found'),
      );

      await expect(controller.restore(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when organization is not deleted', async () => {
      service.restore.mockRejectedValue(
        new BadRequestException('Organization is not deleted'),
      );

      await expect(controller.restore(1)).rejects.toThrow(BadRequestException);
    });
  });
});

