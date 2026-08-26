ALTER TABLE "identities" ADD COLUMN IF NOT EXISTS "portfolio_url" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "identities" ADD COLUMN IF NOT EXISTS "website_url" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "identities" ADD COLUMN IF NOT EXISTS "social_links" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "identities" ADD COLUMN IF NOT EXISTS "response_time_hours" integer DEFAULT 24 NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "preview_url" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "collection" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "tags" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "license_type" text DEFAULT 'Personal use' NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "delivery_time" text DEFAULT 'Available after payment' NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "view_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "saved_listings" ("user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade, "listing_id" uuid NOT NULL REFERENCES "listings"("id") ON DELETE cascade, "created_at" timestamp with time zone DEFAULT now() NOT NULL);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "saved_listings_user_listing_idx" ON "saved_listings" ("user_id", "listing_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "saved_listings_listing_idx" ON "saved_listings" ("listing_id");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "creator_follows" ("follower_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade, "creator_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade, "created_at" timestamp with time zone DEFAULT now() NOT NULL);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "creator_follows_follower_creator_idx" ON "creator_follows" ("follower_id", "creator_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "creator_follows_creator_idx" ON "creator_follows" ("creator_id");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "listing_reviews" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "transaction_id" uuid NOT NULL REFERENCES "transactions"("id") ON DELETE cascade, "listing_id" uuid NOT NULL REFERENCES "listings"("id") ON DELETE cascade, "buyer_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade, "seller_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade, "rating" integer NOT NULL, "body" text DEFAULT '' NOT NULL, "hidden" boolean DEFAULT false NOT NULL, "created_at" timestamp with time zone DEFAULT now() NOT NULL);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "listing_reviews_transaction_idx" ON "listing_reviews" ("transaction_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "listing_reviews_listing_idx" ON "listing_reviews" ("listing_id", "created_at");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_messages" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "transaction_id" uuid NOT NULL REFERENCES "transactions"("id") ON DELETE cascade, "sender_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade, "body" text NOT NULL, "created_at" timestamp with time zone DEFAULT now() NOT NULL);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "purchase_messages_transaction_idx" ON "purchase_messages" ("transaction_id", "created_at");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "seller_coupons" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "seller_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade, "code" text NOT NULL, "discount_percent" integer NOT NULL, "active" boolean DEFAULT true NOT NULL, "expires_at" timestamp with time zone, "created_at" timestamp with time zone DEFAULT now() NOT NULL);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "seller_coupons_seller_code_idx" ON "seller_coupons" ("seller_id", "code");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "referral_codes" ("user_id" uuid PRIMARY KEY REFERENCES "users"("id") ON DELETE cascade, "code" text NOT NULL, "created_at" timestamp with time zone DEFAULT now() NOT NULL);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "referral_codes_code_idx" ON "referral_codes" ("code");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade, "title" text NOT NULL, "body" text DEFAULT '' NOT NULL, "href" text DEFAULT '' NOT NULL, "read" boolean DEFAULT false NOT NULL, "created_at" timestamp with time zone DEFAULT now() NOT NULL);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_user_idx" ON "notifications" ("user_id", "created_at");