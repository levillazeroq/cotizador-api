import { PaymentRepository } from '../payment.repository';

export const createPaymentRepositoryMock = (): jest.Mocked<PaymentRepository> => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByCartId: jest.fn(),
  findByTransactionId: jest.fn(),
  findByStatus: jest.fn(),
  findAll: jest.fn(),
  findAllPaginated: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
  uploadProof: jest.fn(),
  delete: jest.fn(),
  getGlobalStats: jest.fn(),
  getPaymentStats: jest.fn(),
} as unknown as jest.Mocked<PaymentRepository>);

