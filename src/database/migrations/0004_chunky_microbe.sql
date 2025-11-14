-- Create organization_payment_methods table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'organization_payment_methods'
    ) THEN
        CREATE TABLE "organization_payment_methods" (
            "id" bigserial PRIMARY KEY NOT NULL,
            "organization_id" bigint NOT NULL,
            "is_check_active" boolean DEFAULT false NOT NULL,
            "is_web_pay_active" boolean DEFAULT false NOT NULL,
            "is_bank_transfer_active" boolean DEFAULT false NOT NULL,
            "created_at" timestamp with time zone DEFAULT now() NOT NULL,
            "updated_at" timestamp with time zone DEFAULT now() NOT NULL
        );
    END IF;
END $$;
--> statement-breakpoint

-- Add foreign key constraint for organization_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'organization_payment_methods_organization_id_organizations_id_fk'
    ) THEN
        ALTER TABLE "organization_payment_methods" 
        ADD CONSTRAINT "organization_payment_methods_organization_id_organizations_id_fk" 
        FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") 
        ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;
--> statement-breakpoint

-- Create index on organization_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'organization_payment_methods' 
        AND indexname = 'idx_organization_payment_methods_org_id'
    ) THEN
        CREATE INDEX "idx_organization_payment_methods_org_id" 
        ON "organization_payment_methods" USING btree ("organization_id");
    END IF;
END $$;
--> statement-breakpoint

-- Create trigger for updating updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_organization_payment_methods_updated_at'
    ) THEN
        CREATE TRIGGER update_organization_payment_methods_updated_at 
        BEFORE UPDATE ON "organization_payment_methods"
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;