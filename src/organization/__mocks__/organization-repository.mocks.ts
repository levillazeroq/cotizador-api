import { OrganizationRepository } from '../organization.repository';

export const createOrganizationRepositoryMock = (): jest.Mocked<OrganizationRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByCode: jest.fn(),
  findByStatus: jest.fn(),
  search: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  hardDelete: jest.fn(),
  restore: jest.fn(),
  updateStatus: jest.fn(),
  updateSettings: jest.fn(),
} as unknown as jest.Mocked<OrganizationRepository>);

