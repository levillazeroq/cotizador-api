export interface PriceListConditionValue {
  customer_type?: string;
  min_quantity?: number;
  min_amount?: number;
  to_date?: string;
  from_date?: string;
  [key: string]: any;
}

export interface PriceListCondition {
  id: number;
  organizationId: number;
  priceListId: number;
  status: string;
  conditionType: string;
  operator: string;
  conditionValue: PriceListConditionValue;
  config: any;
  validFrom: string | null;
  validTo: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isValidNow: boolean;
}

export interface Pagination {
  limit: number;
  page: number;
  totalPages: number;
  totalCount: number;
}

export interface PriceListConditionsResponse {
  conditions: PriceListCondition[];
  pagination: Pagination;
}

