ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" timestamp with time zone;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_verification_tokens" (
  "email" text PRIMARY KEY NOT NULL,
  "password_hash" text NOT NULL,
  "display_name" text DEFAULT '' NOT NULL,
  "code_hash" text NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_verification_tokens_expires_idx" ON "email_verification_tokens" USING btree ("expires_at");
