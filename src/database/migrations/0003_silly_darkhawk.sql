-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
--> statement-breakpoint

-- Create organizations table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'organizations'
    ) THEN
        CREATE TABLE "organizations" (
            "id" bigserial PRIMARY KEY NOT NULL,
            "name" varchar(255) NOT NULL,
            "code" varchar(50) NOT NULL,
            "description" text,
            "status" varchar(20) DEFAULT 'active' NOT NULL,
            "settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
            "created_at" timestamp with time zone DEFAULT now() NOT NULL,
            "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
            "deleted_at" timestamp with time zone
        );
    END IF;
END $$;
--> statement-breakpoint

-- Add unique constraint on code if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'organizations_code_unique'
    ) THEN
        ALTER TABLE "organizations" 
        ADD CONSTRAINT "organizations_code_unique" UNIQUE("code");
    END IF;
END $$;
--> statement-breakpoint

-- Add status check constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'organizations_status_check'
    ) THEN
        ALTER TABLE "organizations" 
        ADD CONSTRAINT "organizations_status_check" 
        CHECK (status IN ('active', 'inactive', 'suspended'));
    END IF;
END $$;
--> statement-breakpoint

-- Create index on code if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'organizations' 
        AND indexname = 'idx_organizations_code'
    ) THEN
        CREATE INDEX "idx_organizations_code" ON "organizations" USING btree ("code");
    END IF;
END $$;
--> statement-breakpoint

-- Create index on status if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'organizations' 
        AND indexname = 'idx_organizations_status'
    ) THEN
        CREATE INDEX "idx_organizations_status" ON "organizations" USING btree ("status");
    END IF;
END $$;
--> statement-breakpoint

-- Create index on deleted_at if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'organizations' 
        AND indexname = 'idx_organizations_deleted_at'
    ) THEN
        CREATE INDEX "idx_organizations_deleted_at" ON "organizations" USING btree ("deleted_at");
    END IF;
END $$;
--> statement-breakpoint

-- Create trigger for updating updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_organizations_updated_at'
    ) THEN
        CREATE TRIGGER update_organizations_updated_at 
        BEFORE UPDATE ON "organizations"
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;