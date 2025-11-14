-- Create payment_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_type') THEN
        CREATE TYPE "public"."payment_type" AS ENUM('web_pay', 'bank_transfer', 'check');
    END IF;
END $$;
--> statement-breakpoint

-- Add payment_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'payment_type'
    ) THEN
        ALTER TABLE "payments" ADD COLUMN "payment_type" "payment_type";
    END IF;
END $$;