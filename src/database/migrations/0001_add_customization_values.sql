-- Migration: Add customization_values to cart_items
-- Created: 2024-12-18

ALTER TABLE "cart_items" ADD COLUMN "customization_values" jsonb;

