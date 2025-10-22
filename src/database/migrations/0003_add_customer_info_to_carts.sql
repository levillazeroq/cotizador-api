-- Migration: Add customer information fields to carts
-- Created: 2025-10-21

ALTER TABLE "carts" ADD COLUMN "full_name" text;
ALTER TABLE "carts" ADD COLUMN "document_type" varchar(50);
ALTER TABLE "carts" ADD COLUMN "document_number" varchar(100);

