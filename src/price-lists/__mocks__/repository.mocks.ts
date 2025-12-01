import { PriceListRepository } from '../repositories/price-list.repository';
import { PriceListConditionRepository } from '../repositories/price-list-condition.repository';
import { TaxClassRepository } from '../repositories/tax-class.repository';
import { ProductPriceRepository } from '../repositories/product-price.repository';

export const createPriceListRepositoryMock = (): jest.Mocked<PriceListRepository> => ({
  findAll: jest.fn(),
  findAllWithConditions: jest.fn(),
  findById: jest.fn(),
  findByIdWithConditions: jest.fn(),
  findDefault: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as unknown as jest.Mocked<PriceListRepository>);

export const createPriceListConditionRepositoryMock = (): jest.Mocked<PriceListConditionRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as unknown as jest.Mocked<PriceListConditionRepository>);

export const createTaxClassRepositoryMock = (): jest.Mocked<TaxClassRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as unknown as jest.Mocked<TaxClassRepository>);

export const createProductPriceRepositoryMock = (): jest.Mocked<ProductPriceRepository> => ({
  findByPriceListId: jest.fn(),
  findByPriceListIdPaginated: jest.fn(),
  findByProductId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as unknown as jest.Mocked<ProductPriceRepository>);

