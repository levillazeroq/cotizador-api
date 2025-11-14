-- Add valid_until column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'carts' 
        AND column_name = 'valid_until'
    ) THEN
        ALTER TABLE "carts" ADD COLUMN "valid_until" timestamp;
    END IF;
END $$;
--> statement-breakpoint

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'carts' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE "carts" ADD COLUMN "status" varchar(50) DEFAULT 'draft' NOT NULL;
    END IF;
END $$;
--> statement-breakpoint

-- Add is_expired column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'carts' 
        AND column_name = 'is_expired'
    ) THEN
        ALTER TABLE "carts" ADD COLUMN "is_expired" boolean DEFAULT false NOT NULL;
    END IF;
END $$;
--> statement-breakpoint

-- Add expiration_notified column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'carts' 
        AND column_name = 'expiration_notified'
    ) THEN
        ALTER TABLE "carts" ADD COLUMN "expiration_notified" boolean DEFAULT false NOT NULL;
    END IF;
END $$;
--> statement-breakpoint

-- Add price_validated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'carts' 
        AND column_name = 'price_validated_at'
    ) THEN
        ALTER TABLE "carts" ADD COLUMN "price_validated_at" timestamp;
    END IF;
END $$;
--> statement-breakpoint

-- Add price_change_approved column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'carts' 
        AND column_name = 'price_change_approved'
    ) THEN
        ALTER TABLE "carts" ADD COLUMN "price_change_approved" boolean DEFAULT false NOT NULL;
    END IF;
END $$;
--> statement-breakpoint

-- Add price_change_approved_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'carts' 
        AND column_name = 'price_change_approved_at'
    ) THEN
        ALTER TABLE "carts" ADD COLUMN "price_change_approved_at" timestamp;
    END IF;
END $$;
--> statement-breakpoint

-- Add original_total_price column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'carts' 
        AND column_name = 'original_total_price'
    ) THEN
        ALTER TABLE "carts" ADD COLUMN "original_total_price" numeric(10, 2);
    END IF;
END $$;