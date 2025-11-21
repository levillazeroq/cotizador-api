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
}

export interface PriceListsResponse {
  priceLists: PriceList[];
}

