ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "file_type" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "compatibility" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "includes_updates" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "update_policy" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "listing_reviews" ADD COLUMN IF NOT EXISTS "seller_reply" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "listing_reviews" ADD COLUMN IF NOT EXISTS "seller_replied_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ADD COLUMN IF NOT EXISTS "referral_code" text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "price_alerts" ("user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade, "listing_id" uuid NOT NULL REFERENCES "listings"("id") ON DELETE cascade, "created_at" timestamp with time zone DEFAULT now() NOT NULL);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "price_alerts_user_listing_idx" ON "price_alerts" ("user_id", "listing_id");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "referrals" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "referrer_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade, "referee_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade, "status" text DEFAULT 'signed_up' NOT NULL, "reward_cents" integer DEFAULT 0 NOT NULL, "created_at" timestamp with time zone DEFAULT now() NOT NULL, "qualified_at" timestamp with time zone);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "referrals_referee_idx" ON "referrals" ("referee_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "referrals_referrer_idx" ON "referrals" ("referrer_id", "created_at");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "listing_bundles" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "seller_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade, "name" text NOT NULL, "description" text DEFAULT '' NOT NULL, "listing_ids" jsonb DEFAULT '[]'::jsonb NOT NULL, "discount_percent" integer DEFAULT 10 NOT NULL, "active" boolean DEFAULT true NOT NULL, "expires_at" timestamp with time zone, "created_at" timestamp with time zone DEFAULT now() NOT NULL);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "listing_bundles_seller_idx" ON "listing_bundles" ("seller_id", "created_at");