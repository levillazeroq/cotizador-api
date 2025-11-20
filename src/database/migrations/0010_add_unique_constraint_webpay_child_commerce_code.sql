-- Add unique constraint to web_pay_child_commerce_code column
-- This ensures each organization has a unique WebPay child commerce code

DO $$ 
BEGIN
    -- Check if constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'organization_payment_methods_web_pay_child_commerce_code_unique'
    ) THEN
        -- Add unique constraint
        ALTER TABLE "organization_payment_methods" 
        ADD CONSTRAINT "organization_payment_methods_web_pay_child_commerce_code_unique" 
        UNIQUE ("web_pay_child_commerce_code");
    END IF;
END $$;

