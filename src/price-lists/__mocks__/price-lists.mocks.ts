import type { PriceList } from '../../database/schemas';

export const mockPriceList: PriceList = {
  id: 1,
  organizationId: 1,
  name: 'Lista de Precios Principal',
  currency: 'CLP',
  isDefault: true,
  status: 'active',
  pricingTaxMode: 'tax_included',
  taxClassId: null,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

export const mockPriceList2: PriceList = {
  id: 2,
  organizationId: 1,
  name: 'Lista de Precios Mayorista',
  currency: 'CLP',
  isDefault: false,
  status: 'active',
  pricingTaxMode: 'tax_excluded',
  taxClassId: null,
  createdAt: new Date('2024-01-02T00:00:00Z'),
  updatedAt: new Date('2024-01-02T00:00:00Z'),
};

export const mockPriceListInactive: PriceList = {
  id: 3,
  organizationId: 1,
  name: 'Lista de Precios Inactiva',
  currency: 'USD',
  isDefault: false,
  status: 'inactive',
  pricingTaxMode: 'tax_included',
  taxClassId: null,
  createdAt: new Date('2024-01-03T00:00:00Z'),
  updatedAt: new Date('2024-01-03T00:00:00Z'),
};

export const mockPriceLists: PriceList[] = [
  mockPriceList,
  mockPriceList2,
  mockPriceListInactive,
];

export const mockPriceListWithConditions = {
  ...mockPriceList,
  conditions: [],
};

export const mockPriceListsWithConditions = [
  mockPriceListWithConditions,
  {
    ...mockPriceList2,
    conditions: [],
  },
  {
    ...mockPriceListInactive,
    conditions: [],
  },
];

export const mockCreatePriceListDto = {
  name: 'Nueva Lista de Precios',
  currency: 'CLP',
  isDefault: false,
  status: 'active',
  pricingTaxMode: 'tax_included',
};

export const mockUpdatePriceListDto = {
  name: 'Lista de Precios Actualizada',
  currency: 'USD',
  isDefault: true,
  status: 'active',
  pricingTaxMode: 'tax_excluded',
};

export const mockProductWithPrice = {
  id: 1,
  name: 'Producto Test',
  sku: 'PROD-001',
  description: 'Descripción del producto',
  imageUrl: 'https://example.com/image.jpg',
  price: {
    id: 1,
    amount: '10000.00',
    currency: 'CLP',
    taxIncluded: true,
    validFrom: null,
    validTo: null,
  },
};

export const mockProductPricesResponse = {
  products: [mockProductWithPrice],
  total: 1,
  page: 1,
  limit: 20,
  totalPages: 1,
};

export const mockEmptyProductPricesResponse = {
  products: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
};

export const mockProductPrice = {
  id: 1,
  productId: 1,
  priceListId: 1,
  currency: 'CLP',
  amount: '10000.00',
  taxIncluded: true,
  validFrom: null,
  validTo: null,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

