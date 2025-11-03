CREATE TABLE "cart_changelog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid NOT NULL,
	"product_id" varchar(255) NOT NULL,
	"product_name" text NOT NULL,
	"sku" varchar(100),
	"operation" varchar(10) NOT NULL,
	"quantity" integer NOT NULL,
	"price" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
