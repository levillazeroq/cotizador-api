import type { Organization } from '../../database/schemas';

export const mockOrganization: Organization = {
  id: 1,
  name: 'Test Organization',
  code: 'TEST001',
  description: 'Test Description',
  status: 'active',
  settings: { theme: 'light', language: 'es' },
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  deletedAt: null,
};

export const mockOrganizationDeleted: Organization = {
  ...mockOrganization,
  deletedAt: new Date('2024-01-15T00:00:00Z'),
};

export const mockOrganizations: Organization[] = [
  mockOrganization,
  {
    id: 2,
    name: 'Another Organization',
    code: 'ANOTHER001',
    description: 'Another Description',
    status: 'active',
    settings: {},
    createdAt: new Date('2024-01-02T00:00:00Z'),
    updatedAt: new Date('2024-01-02T00:00:00Z'),
    deletedAt: null,
  },
  {
    id: 3,
    name: 'Inactive Organization',
    code: 'INACTIVE001',
    description: 'Inactive Description',
    status: 'inactive',
    settings: {},
    createdAt: new Date('2024-01-03T00:00:00Z'),
    updatedAt: new Date('2024-01-03T00:00:00Z'),
    deletedAt: null,
  },
];

export const mockCreateOrganizationDto = {
  name: 'New Organization',
  code: 'NEW001',
  description: 'New Description',
  status: 'active' as const,
  settings: { theme: 'dark' },
};

export const mockUpdateOrganizationDto = {
  name: 'Updated Organization',
  description: 'Updated Description',
};

