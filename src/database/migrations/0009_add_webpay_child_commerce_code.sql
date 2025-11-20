-- Add web_pay_child_commerce_code column to organization_payment_methods table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'organization_payment_methods'
        AND column_name = 'web_pay_child_commerce_code'
    ) THEN
        ALTER TABLE "organization_payment_methods" 
        ADD COLUMN "web_pay_child_commerce_code" varchar(50);
    END IF;
END $$;

