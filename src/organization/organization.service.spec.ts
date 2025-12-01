import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationRepository } from './organization.repository';
import {
  mockOrganization,
  mockOrganizationDeleted,
  mockOrganizations,
  mockCreateOrganizationDto,
  mockUpdateOrganizationDto,
  createOrganizationRepositoryMock,
} from './__mocks__';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let repository: jest.Mocked<OrganizationRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        {
          provide: OrganizationRepository,
          useValue: createOrganizationRepositoryMock(),
        },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
    repository = module.get(OrganizationRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an organization', async () => {
      repository.findByCode.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockOrganization);

      const result = await service.create(mockCreateOrganizationDto);

      expect(result).toEqual(mockOrganization);
      expect(repository.findByCode).toHaveBeenCalledWith(
        mockCreateOrganizationDto.code,
      );
      expect(repository.create).toHaveBeenCalledWith({
        ...mockCreateOrganizationDto,
        settings: mockCreateOrganizationDto.settings || {},
        status: mockCreateOrganizationDto.status || 'active',
      });
    });

    it('should use default status when not provided', async () => {
      const dtoWithoutStatus = {
        name: 'New Org',
        code: 'NEW001',
      };

      repository.findByCode.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockOrganization);

      await service.create(dtoWithoutStatus as any);

      expect(repository.create).toHaveBeenCalledWith({
        ...dtoWithoutStatus,
        settings: {},
        status: 'active',
      });
    });

    it('should use default settings when not provided', async () => {
      const dtoWithoutSettings = {
        name: 'New Org',
        code: 'NEW001',
        status: 'active' as const,
      };

      repository.findByCode.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockOrganization);

      await service.create(dtoWithoutSettings as any);

      expect(repository.create).toHaveBeenCalledWith({
        ...dtoWithoutSettings,
        settings: {},
        status: 'active',
      });
    });

    it('should throw ConflictException when code already exists', async () => {
      repository.findByCode.mockResolvedValue(mockOrganization);

      await expect(service.create(mockCreateOrganizationDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.findByCode).toHaveBeenCalledWith(
        mockCreateOrganizationDto.code,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all organizations', async () => {
      repository.findAll.mockResolvedValue(mockOrganizations);

      const result = await service.findAll();

      expect(result).toEqual(mockOrganizations);
      expect(repository.findAll).toHaveBeenCalledWith(false);
    });

    it('should include deleted organizations when requested', async () => {
      repository.findAll.mockResolvedValue([
        ...mockOrganizations,
        mockOrganizationDeleted,
      ]);

      const result = await service.findAll(true);

      expect(result).toHaveLength(4);
      expect(repository.findAll).toHaveBeenCalledWith(true);
    });
  });

  describe('findOne', () => {
    it('should return an organization by id', async () => {
      repository.findById.mockResolvedValue(mockOrganization);

      const result = await service.findOne(1);

      expect(result).toEqual(mockOrganization);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when organization not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('findByCode', () => {
    it('should return an organization by code', async () => {
      repository.findByCode.mockResolvedValue(mockOrganization);

      const result = await service.findByCode('TEST001');

      expect(result).toEqual(mockOrganization);
      expect(repository.findByCode).toHaveBeenCalledWith('TEST001');
    });

    it('should throw NotFoundException when organization not found', async () => {
      repository.findByCode.mockResolvedValue(null);

      await expect(service.findByCode('INVALID')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findByCode).toHaveBeenCalledWith('INVALID');
    });
  });

  describe('findByStatus', () => {
    it('should return organizations by status', async () => {
      const activeOrgs = mockOrganizations.filter((org) => org.status === 'active');
      repository.findByStatus.mockResolvedValue(activeOrgs);

      const result = await service.findByStatus('active');

      expect(result).toEqual(activeOrgs);
      expect(repository.findByStatus).toHaveBeenCalledWith('active');
    });

    it('should throw BadRequestException for invalid status', async () => {
      await expect(service.findByStatus('invalid')).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.findByStatus).not.toHaveBeenCalled();
    });

    it('should accept valid statuses', async () => {
      repository.findByStatus.mockResolvedValue([]);

      await service.findByStatus('active');
      await service.findByStatus('inactive');
      await service.findByStatus('suspended');

      expect(repository.findByStatus).toHaveBeenCalledTimes(3);
    });
  });

  describe('search', () => {
    it('should search organizations', async () => {
      repository.search.mockResolvedValue([mockOrganization]);

      const result = await service.search('Test');

      expect(result).toEqual([mockOrganization]);
      expect(repository.search).toHaveBeenCalledWith('Test');
    });

    it('should throw BadRequestException for empty search term', async () => {
      await expect(service.search('')).rejects.toThrow(BadRequestException);
      await expect(service.search('   ')).rejects.toThrow(BadRequestException);
      expect(repository.search).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for null search term', async () => {
      await expect(service.search(null as any)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.search).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an organization', async () => {
      const updatedOrg = { ...mockOrganization, ...mockUpdateOrganizationDto };

      repository.findById.mockResolvedValue(mockOrganization);
      repository.update.mockResolvedValue(updatedOrg);

      const result = await service.update(1, mockUpdateOrganizationDto);

      expect(result).toEqual(updatedOrg);
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.update).toHaveBeenCalledWith(1, mockUpdateOrganizationDto);
    });

    it('should throw NotFoundException when organization not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update(999, mockUpdateOrganizationDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should check for code conflict when updating code', async () => {
      const existingOrg = { ...mockOrganization, code: 'EXISTING001' };
      const updateDto = { code: 'NEWCODE001' };

      repository.findById.mockResolvedValue(mockOrganization);
      repository.findByCode.mockResolvedValue(null);
      repository.update.mockResolvedValue({ ...mockOrganization, ...updateDto });

      await service.update(1, updateDto);

      expect(repository.findByCode).toHaveBeenCalledWith('NEWCODE001');
    });

    it('should not check for code conflict when code is not changed', async () => {
      repository.findById.mockResolvedValue(mockOrganization);
      repository.update.mockResolvedValue(mockOrganization);

      await service.update(1, { name: 'Updated Name' });

      expect(repository.findByCode).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new code already exists', async () => {
      const existingOrg = { ...mockOrganization, id: 2, code: 'EXISTING001' };
      const updateDto = { code: 'EXISTING001' };

      repository.findById.mockResolvedValue(mockOrganization);
      repository.findByCode.mockResolvedValue(existingOrg);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when update fails', async () => {
      repository.findById.mockResolvedValue(mockOrganization);
      repository.update.mockResolvedValue(null);

      await expect(service.update(1, mockUpdateOrganizationDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update organization status', async () => {
      const updatedOrg = { ...mockOrganization, status: 'inactive' as const };

      repository.findById.mockResolvedValue(mockOrganization);
      repository.updateStatus.mockResolvedValue(updatedOrg);

      const result = await service.updateStatus(1, 'inactive');

      expect(result).toEqual(updatedOrg);
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.updateStatus).toHaveBeenCalledWith(1, 'inactive');
    });

    it('should throw NotFoundException when organization not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.updateStatus(1, 'inactive')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when update fails', async () => {
      repository.findById.mockResolvedValue(mockOrganization);
      repository.updateStatus.mockResolvedValue(null);

      await expect(service.updateStatus(1, 'inactive')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateSettings', () => {
    it('should update organization settings', async () => {
      const newSettings = { theme: 'dark', language: 'en' };
      const updatedOrg = { ...mockOrganization, settings: newSettings };

      repository.findById.mockResolvedValue(mockOrganization);
      repository.updateSettings.mockResolvedValue(updatedOrg);

      const result = await service.updateSettings(1, newSettings);

      expect(result).toEqual(updatedOrg);
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.updateSettings).toHaveBeenCalledWith(1, newSettings);
    });

    it('should throw NotFoundException when organization not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.updateSettings(1, {})).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.updateSettings).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when update fails', async () => {
      repository.findById.mockResolvedValue(mockOrganization);
      repository.updateSettings.mockResolvedValue(null);

      await expect(service.updateSettings(1, {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete an organization', async () => {
      const deletedOrg = { ...mockOrganization, deletedAt: new Date() };

      repository.findById.mockResolvedValue(mockOrganization);
      repository.softDelete.mockResolvedValue(deletedOrg);

      const result = await service.remove(1);

      expect(result).toEqual({
        message: 'Organization with ID 1 has been soft deleted',
      });
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when organization not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(repository.softDelete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when delete fails', async () => {
      repository.findById.mockResolvedValue(mockOrganization);
      repository.softDelete.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete an organization', async () => {
      repository.findById.mockResolvedValue(mockOrganization);
      repository.hardDelete.mockResolvedValue(true);

      const result = await service.hardDelete(1);

      expect(result).toEqual({
        message: 'Organization with ID 1 has been permanently deleted',
      });
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.hardDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when organization not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.hardDelete(999)).rejects.toThrow(NotFoundException);
      expect(repository.hardDelete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when delete fails', async () => {
      repository.findById.mockResolvedValue(mockOrganization);
      repository.hardDelete.mockResolvedValue(false);

      await expect(service.hardDelete(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('should restore a soft-deleted organization', async () => {
      repository.findById.mockResolvedValue(mockOrganizationDeleted);
      repository.restore.mockResolvedValue(mockOrganization);

      const result = await service.restore(1);

      expect(result).toEqual(mockOrganization);
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.restore).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when organization not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.restore(999)).rejects.toThrow(NotFoundException);
      expect(repository.restore).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when organization is not deleted', async () => {
      repository.findById.mockResolvedValue(mockOrganization);

      await expect(service.restore(1)).rejects.toThrow(BadRequestException);
      expect(repository.restore).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when restore fails', async () => {
      repository.findById.mockResolvedValue(mockOrganizationDeleted);
      repository.restore.mockResolvedValue(null);

      await expect(service.restore(1)).rejects.toThrow(NotFoundException);
    });
  });
});

