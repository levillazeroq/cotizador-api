export interface PriceListCondition {
  id: number;
  name: string;
  description: string;
  priority: number;
  status: string;
  conditionType: string;
  operator: string;
  conditionValue: Record<string, any>;
  discountType: string;
  discountValue: number;
  config: any | null;
  validFrom: string | null;
  validTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PriceList {
  id: number;
  name: string;
  currency: string;
  isDefault: boolean;
  status: string;
  pricingTaxMode: string;
  createdAt: string;
  isActive: boolean;
  hasTaxMode: boolean;
  conditions: PriceListCondition[];
}

export interface PriceListsResponse {
  priceLists: PriceList[];
}

