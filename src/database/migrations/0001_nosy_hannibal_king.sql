ALTER TABLE "carts" ADD COLUMN "valid_until" timestamp;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "status" varchar(50) DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "is_expired" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "expiration_notified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "price_validated_at" timestamp;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "price_change_approved" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "price_change_approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "original_total_price" numeric(10, 2);