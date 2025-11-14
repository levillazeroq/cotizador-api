import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationRepository } from './organization.repository';
import { Organization } from '../database/schemas';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    // Check if organization with the same code already exists
    const existingOrg = await this.organizationRepository.findByCode(
      createOrganizationDto.code,
    );

    if (existingOrg) {
      throw new ConflictException(
        `Organization with code '${createOrganizationDto.code}' already exists`,
      );
    }

    return await this.organizationRepository.create({
      ...createOrganizationDto,
      settings: createOrganizationDto.settings || {},
      status: createOrganizationDto.status || 'active',
    });
  }

  async findAll(includeDeleted = false): Promise<Organization[]> {
    return await this.organizationRepository.findAll(includeDeleted);
  }

  async findOne(id: number): Promise<Organization> {
    const organization = await this.organizationRepository.findById(id);

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  async findByCode(code: string): Promise<Organization> {
    const organization = await this.organizationRepository.findByCode(code);

    if (!organization) {
      throw new NotFoundException(
        `Organization with code '${code}' not found`,
      );
    }

    return organization;
  }

  async findByStatus(status: string): Promise<Organization[]> {
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      );
    }

    return await this.organizationRepository.findByStatus(status);
  }

  async search(searchTerm: string): Promise<Organization[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new BadRequestException('Search term cannot be empty');
    }

    return await this.organizationRepository.search(searchTerm);
  }

  async update(
    id: number,
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<Organization> {
    const organization = await this.organizationRepository.findById(id);

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    // If updating code, check if new code already exists
    if (
      updateOrganizationDto.code &&
      updateOrganizationDto.code !== organization.code
    ) {
      const existingOrg = await this.organizationRepository.findByCode(
        updateOrganizationDto.code,
      );

      if (existingOrg) {
        throw new ConflictException(
          `Organization with code '${updateOrganizationDto.code}' already exists`,
        );
      }
    }

    const updated = await this.organizationRepository.update(
      id,
      updateOrganizationDto,
    );

    if (!updated) {
      throw new NotFoundException(`Failed to update organization with ID ${id}`);
    }

    return updated;
  }

  async updateStatus(
    id: number,
    status: 'active' | 'inactive' | 'suspended',
  ): Promise<Organization> {
    const organization = await this.organizationRepository.findById(id);

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    const updated = await this.organizationRepository.updateStatus(id, status);

    if (!updated) {
      throw new NotFoundException(
        `Failed to update status for organization with ID ${id}`,
      );
    }

    return updated;
  }

  async updateSettings(
    id: number,
    settings: Record<string, any>,
  ): Promise<Organization> {
    const organization = await this.organizationRepository.findById(id);

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    const updated = await this.organizationRepository.updateSettings(
      id,
      settings,
    );

    if (!updated) {
      throw new NotFoundException(
        `Failed to update settings for organization with ID ${id}`,
      );
    }

    return updated;
  }

  async remove(id: number): Promise<{ message: string }> {
    const organization = await this.organizationRepository.findById(id);

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    const deleted = await this.organizationRepository.softDelete(id);

    if (!deleted) {
      throw new NotFoundException(
        `Failed to delete organization with ID ${id}`,
      );
    }

    return {
      message: `Organization with ID ${id} has been soft deleted`,
    };
  }

  async hardDelete(id: number): Promise<{ message: string }> {
    const organization = await this.organizationRepository.findById(id);

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    const deleted = await this.organizationRepository.hardDelete(id);

    if (!deleted) {
      throw new NotFoundException(
        `Failed to permanently delete organization with ID ${id}`,
      );
    }

    return {
      message: `Organization with ID ${id} has been permanently deleted`,
    };
  }

  async restore(id: number): Promise<Organization> {
    const organization = await this.organizationRepository.findById(id);

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    if (!organization.deletedAt) {
      throw new BadRequestException(
        `Organization with ID ${id} is not deleted`,
      );
    }

    const restored = await this.organizationRepository.restore(id);

    if (!restored) {
      throw new NotFoundException(
        `Failed to restore organization with ID ${id}`,
      );
    }

    return restored;
  }
}
