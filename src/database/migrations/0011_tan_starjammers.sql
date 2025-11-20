--> statement-breakpoint
-- Safely alter payment_type column
DO $$ 
BEGIN
  -- Check if payments table and payment_type column exist
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'payments' 
             AND column_name = 'payment_type') THEN
    
    -- Convert to text first
    ALTER TABLE "payments" ALTER COLUMN "payment_type" SET DATA TYPE text;
    
    -- Drop old enum type if it exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_type') THEN
      DROP TYPE "public"."payment_type";
    END IF;
    
    -- Create new enum type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_type') THEN
      CREATE TYPE "public"."payment_type" AS ENUM('webpay', 'bank_transfer', 'check');
    END IF;
    
    -- Convert back to enum type
    ALTER TABLE "payments" ALTER COLUMN "payment_type" 
      SET DATA TYPE "public"."payment_type" 
      USING "payment_type"::"public"."payment_type";
    
    -- Set NOT NULL constraint
    ALTER TABLE "payments" ALTER COLUMN "payment_type" SET NOT NULL;
  END IF;
END $$;
--> statement-breakpoint
-- Safely alter web_pay_prefix column
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'organization_payment_methods' 
             AND column_name = 'web_pay_prefix') THEN
    ALTER TABLE "organization_payment_methods" 
      ALTER COLUMN "web_pay_prefix" SET DATA TYPE varchar(9);
    ALTER TABLE "organization_payment_methods" 
      ALTER COLUMN "web_pay_prefix" SET DEFAULT 'workit';
  END IF;
END $$;
--> statement-breakpoint
-- Safely add authorization_code column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'payments' 
                 AND column_name = 'authorization_code') THEN
    ALTER TABLE "payments" ADD COLUMN "authorization_code" varchar(50);
  END IF;
END $$;
--> statement-breakpoint
-- Safely add card_last_four_digits column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'payments' 
                 AND column_name = 'card_last_four_digits') THEN
    ALTER TABLE "payments" ADD COLUMN "card_last_four_digits" varchar(4);
  END IF;
END $$;
--> statement-breakpoint
-- Safely add web_pay_child_commerce_code column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'organization_payment_methods' 
                 AND column_name = 'web_pay_child_commerce_code') THEN
    ALTER TABLE "organization_payment_methods" 
      ADD COLUMN "web_pay_child_commerce_code" varchar(50);
  END IF;
END $$;
--> statement-breakpoint
-- Safely drop payment_method_id column
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'payments' 
             AND column_name = 'payment_method_id') THEN
    ALTER TABLE "payments" DROP COLUMN "payment_method_id";
  END IF;
END $$;
--> statement-breakpoint
-- Safely add unique constraint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_schema = 'public' 
                 AND constraint_name = 'organization_payment_methods_web_pay_child_commerce_code_unique' 
                 AND table_name = 'organization_payment_methods') THEN
    ALTER TABLE "organization_payment_methods" 
      ADD CONSTRAINT "organization_payment_methods_web_pay_child_commerce_code_unique" 
      UNIQUE("web_pay_child_commerce_code");
  END IF;
END $$;
--> statement-breakpoint
-- Safely drop payment_method_type enum
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_type') THEN
    DROP TYPE "public"."payment_method_type";
  END IF;
END $$;