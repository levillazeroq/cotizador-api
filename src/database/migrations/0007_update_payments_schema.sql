-- Migration: Update payments table schema
-- Remove payment_method_id, add WebPay specific fields

-- Step 1: Drop the foreign key constraint first
ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "payments_payment_method_id_payment_methods_id_fk";

-- Step 2: Drop the payment_method_id column
ALTER TABLE "payments" DROP COLUMN IF EXISTS "payment_method_id";

-- Step 3: Make payment_type NOT NULL (set default first for existing rows)
UPDATE "payments" SET "payment_type" = 'bank_transfer' WHERE "payment_type" IS NULL;
ALTER TABLE "payments" ALTER COLUMN "payment_type" SET NOT NULL;

-- Step 4: Add new WebPay specific columns
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "authorization_code" varchar(50);
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "card_last_four_digits" varchar(4);

-- Step 5: Update payment_type enum to use 'webpay' instead of 'web_pay'
-- First, create a new enum type
DO $$ BEGIN
  CREATE TYPE payment_type_new AS ENUM ('webpay', 'bank_transfer', 'check');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Update existing data: 'web_pay' -> 'webpay'
UPDATE "payments" SET "payment_type" = 'bank_transfer' WHERE "payment_type"::text = 'web_pay';

-- Alter the column to use the new enum
ALTER TABLE "payments" 
  ALTER COLUMN "payment_type" TYPE payment_type_new 
  USING ("payment_type"::text::payment_type_new);

-- Drop the old enum and rename the new one
DROP TYPE IF EXISTS payment_type CASCADE;
ALTER TYPE payment_type_new RENAME TO payment_type;

-- Step 6: Drop the payment_methods table (no longer needed)
-- Now we use payment_type enum directly instead of a reference table
DROP TABLE IF EXISTS "payment_methods" CASCADE;
