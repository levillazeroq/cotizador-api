-- Create payment_method_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_type') THEN
        CREATE TYPE "public"."payment_method_type" AS ENUM('webpay', 'transfer', 'check');
    END IF;
END $$;
--> statement-breakpoint

-- Create payment_status enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE "public"."payment_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded');
    END IF;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "payment_method_type" NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"icon" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"requires_proof" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_methods_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "customization_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"display_name" varchar(500) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customization_groups_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "customization_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"placeholder" text,
	"help_text" text,
	"type" text NOT NULL,
	"is_required" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"default_value" text,
	"options" jsonb,
	"min_value" numeric(10, 2),
	"max_value" numeric(10, 2),
	"step" numeric(10, 2),
	"min_length" integer,
	"max_length" integer,
	"pattern" text,
	"file_constraints" jsonb,
	"affects_price" boolean DEFAULT false,
	"price_modifier" numeric(10, 2),
	"price_modifier_type" text,
	"ui_config" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customization_fields_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid NOT NULL,
	"product_id" varchar(255) NOT NULL,
	"name" text NOT NULL,
	"sku" varchar(100) NOT NULL,
	"size" varchar(50),
	"color" varchar(50),
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"image_url" text,
	"customization_values" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" varchar(255) NOT NULL,
	"total_items" integer DEFAULT 0 NOT NULL,
	"total_price" numeric(10, 2) DEFAULT '0' NOT NULL,
	"full_name" text,
	"document_type" varchar(50),
	"document_number" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cart_changelog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid NOT NULL,
	"product_id" varchar(255) NOT NULL,
	"product_name" text NOT NULL,
	"sku" varchar(100),
	"description" text,
	"operation" varchar(10) NOT NULL,
	"quantity" integer NOT NULL,
	"price" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid NOT NULL,
	"payment_method_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"proof_url" text,
	"transaction_id" varchar(255),
	"external_reference" varchar(255),
	"payment_date" timestamp,
	"confirmed_at" timestamp,
	"metadata" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Add foreign key constraint for cart_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'payments_cart_id_carts_id_fk'
    ) THEN
        ALTER TABLE "payments" ADD CONSTRAINT "payments_cart_id_carts_id_fk" 
        FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") 
        ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;
--> statement-breakpoint

-- Add foreign key constraint for payment_method_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'payments_payment_method_id_payment_methods_id_fk'
    ) THEN
        ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_method_id_payment_methods_id_fk" 
        FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") 
        ON DELETE no action ON UPDATE no action;
    END IF;
END $$;