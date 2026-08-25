ALTER TABLE "listings" ADD COLUMN "delivery_file_paths" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "delivery_instructions" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "support_contact" text DEFAULT '' NOT NULL;