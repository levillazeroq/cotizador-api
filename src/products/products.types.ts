export interface ProductPrice {
  id: number;
  price_list_id: number;
  currency: string;
  amount: string;
  tax_included: boolean;
  valid_from: string | null;
  valid_to: string | null;
  created_at: string;
  price_list_name: string;
  price_list_is_default: boolean;
}

export interface ProductMedia {
  id: number;
  type: string;
  url: string;
  position: number;
  alt_text: string | null;
  title: string | null;
  description: string | null;
  file_size: number | null;
  mime_type: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductInventory {
  id: number;
  product_id: number;
  location_id: number;
  on_hand: string;
  reserved: string;
  updated_at: string;
  location_code: string;
  location_name: string;
  location_type: string;
  available: number;
}

export interface ProductMetadata {
  size?: string;
  color?: string;
  [key: string]: any;
}

export interface Product {
  id: number;
  organizationId: number;
  sku: string;
  externalSku: string | null;
  externalName: string | null;
  name: string;
  description: string | null;
  productType: string;
  status: string;
  unitOfMeasure: string | null;
  brand: string | null;
  model: string | null;
  taxClassId: number | null;
  weight: string | null;
  height: string | null;
  width: string | null;
  length: string | null;
  metadata: ProductMetadata | null;
  prices?: ProductPrice[];
  media?: ProductMedia[];
  inventory?: ProductInventory[];
}

export interface ProductWithPricesAndMedia extends Product {
  prices: ProductPrice[] | null;
  media: ProductMedia[] | null;
}
