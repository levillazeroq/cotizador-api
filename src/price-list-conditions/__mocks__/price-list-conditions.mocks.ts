import type { PriceListCondition } from '../../database/schemas';
import type { PriceListCondition as PriceListConditionType } from '../price-list-conditions.types';

export const mockPriceListCondition: PriceListCondition = {
  id: 1,
  organizationId: 1,
  priceListId: 1,
  status: 'active',
  conditionType: 'amount',
  operator: 'greater_than_or_equal',
  conditionValue: {
    min_amount: 10000,
  },
  config: null,
  validFrom: new Date('2024-01-01T00:00:00Z'),
  validTo: null,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

export const mockPriceListCondition2: PriceListCondition = {
  id: 2,
  organizationId: 1,
  priceListId: 1,
  status: 'active',
  conditionType: 'amount',
  operator: 'less_than',
  conditionValue: {
    max_amount: 50000,
  },
  config: null,
  validFrom: null,
  validTo: new Date('2024-12-31T23:59:59Z'),
  createdAt: new Date('2024-01-02T00:00:00Z'),
  updatedAt: new Date('2024-01-02T00:00:00Z'),
};

export const mockPriceListConditionInactive: PriceListCondition = {
  id: 3,
  organizationId: 1,
  priceListId: 1,
  status: 'inactive',
  conditionType: 'amount',
  operator: 'equals',
  conditionValue: {
    amount: 20000,
  },
  config: null,
  validFrom: null,
  validTo: null,
  createdAt: new Date('2024-01-03T00:00:00Z'),
  updatedAt: new Date('2024-01-03T00:00:00Z'),
};

export const mockPriceListConditions: PriceListCondition[] = [
  mockPriceListCondition,
  mockPriceListCondition2,
  mockPriceListConditionInactive,
];

export const mockPriceListConditionType: PriceListConditionType = {
  id: 1,
  organizationId: 1,
  priceListId: 1,
  status: 'active',
  conditionType: 'amount',
  operator: 'greater_than_or_equal',
  conditionValue: {
    min_amount: 10000,
  },
  config: null,
  validFrom: '2024-01-01T00:00:00Z',
  validTo: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  isActive: true,
  isValidNow: true,
};

export const mockPriceListConditionsResponse = {
  conditions: [mockPriceListConditionType],
  pagination: {
    limit: 10,
    page: 1,
    totalPages: 1,
    totalCount: 1,
  },
};

export const mockCreatePriceListConditionDto = {
  conditionType: 'amount',
  operator: 'greater_than_or_equal',
  conditionValue: {
    min_amount: 10000,
  },
  config: null,
  validFrom: '2024-01-01T00:00:00Z',
  validTo: null,
};

export const mockUpdatePriceListConditionDto = {
  operator: 'less_than',
  conditionValue: {
    max_amount: 50000,
  },
  validTo: '2024-12-31T23:59:59Z',
};

export const mockEmptyPriceListConditionsResponse = {
  conditions: [],
  pagination: {
    limit: 10,
    page: 1,
    totalPages: 0,
    totalCount: 0,
  },
};

