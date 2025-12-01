import { ProductRepository } from '../repositories/product.repository';
import { ProductMediaRepository } from '../repositories/product-media.repository';
import { ProductRelationRepository } from '../repositories/product-relation.repository';

export const createProductRepositoryMock = (): jest.Mocked<ProductRepository> => ({
  findById: jest.fn(),
  findByIds: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findBySku: jest.fn(),
} as unknown as jest.Mocked<ProductRepository>);

export const createProductMediaRepositoryMock = (): jest.Mocked<ProductMediaRepository> => ({
  findByProductIds: jest.fn(),
  findByProductId: jest.fn(),
  findPrimaryByProductId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as unknown as jest.Mocked<ProductMediaRepository>);

export const createProductRelationRepositoryMock = (): jest.Mocked<ProductRelationRepository> => ({
  findRelatedProducts: jest.fn(),
  findRelationTypesByProduct: jest.fn(),
} as unknown as jest.Mocked<ProductRelationRepository>);

