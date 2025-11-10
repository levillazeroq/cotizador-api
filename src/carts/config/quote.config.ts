/**
 * Quote Configuration
 * 
 * This configuration defines the policies for quote validity and price changes
 */

export interface QuoteConfig {
  // Quote validity period in days
  validityDays: number;
  
  // Price change threshold percentage
  // If price change is below this threshold, it's applied automatically
  priceChangeThreshold: number;
  
  // Require customer approval if price increases beyond threshold
  requiresApprovalOnIncrease: boolean;
  
  // Automatically apply lower prices if product price decreased
  applyLowerPriceAutomatically: boolean;
  
  // Allow expired quotes to be paid
  allowExpiredQuotes: boolean;
}

export const QUOTE_CONFIG: QuoteConfig = {
  // Quotes are valid for 7 days
  validityDays: 7,
  
  // If price change is less than 5%, apply automatically
  priceChangeThreshold: 5,
  
  // Require customer approval if price increases more than threshold
  requiresApprovalOnIncrease: true,
  
  // Automatically apply lower prices (benefit the customer)
  applyLowerPriceAutomatically: true,
  
  // Don't allow payment on expired quotes
  allowExpiredQuotes: false,
};

/**
 * Cart/Quote Status Types
 */
export enum CartStatus {
  DRAFT = 'draft',           // Cart is being created
  ACTIVE = 'active',         // Quote is active and valid
  EXPIRED = 'expired',       // Quote has passed its validity date
  PAID = 'paid',            // Payment has been completed
  CANCELLED = 'cancelled',   // Quote was cancelled
}

