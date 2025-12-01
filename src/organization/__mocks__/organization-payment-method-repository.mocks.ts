import { OrganizationPaymentMethodRepository } from '../organization-payment-method.repository';

export function createOrganizationPaymentMethodRepositoryMock(): jest.Mocked<OrganizationPaymentMethodRepository> {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByOrganizationId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateByOrganizationId: jest.fn(),
    delete: jest.fn(),
    deleteByOrganizationId: jest.fn(),
  } as unknown as jest.Mocked<OrganizationPaymentMethodRepository>;
}

