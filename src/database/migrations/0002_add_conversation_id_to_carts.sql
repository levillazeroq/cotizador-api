-- Migration: Add conversation_id to carts
-- Created: 2025-01-16

ALTER TABLE "carts" ADD COLUMN "conversation_id" varchar(255) NOT NULL DEFAULT '';

-- Update existing carts with a placeholder conversation_id
-- In production, you may want to handle this differently
UPDATE "carts" SET "conversation_id" = 'legacy_' || "id" WHERE "conversation_id" = '';

