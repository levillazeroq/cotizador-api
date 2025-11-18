-- Migration: Update web_pay_prefix column length from 10 to 9 characters
-- Reason: Format changed to "prefix-cartId" which requires a separator character

-- Step 1: Update column length
ALTER TABLE "organization_payment_methods" 
  ALTER COLUMN "web_pay_prefix" TYPE varchar(9);

-- Step 2: Validate existing data (optional, will fail if any prefix > 9 chars)
-- Check if any existing prefixes would be invalid with the new length
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM "organization_payment_methods" 
    WHERE LENGTH("web_pay_prefix") > 9
  ) THEN
    RAISE EXCEPTION 'Cannot update column: existing prefixes longer than 9 characters found';
  END IF;
END $$;

