ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "delivery_file_paths" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "delivery_instructions" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "support_contact" text DEFAULT '' NOT NULL;