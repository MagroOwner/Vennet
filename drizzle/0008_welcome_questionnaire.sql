CREATE TABLE IF NOT EXISTS "welcome_responses" (
  "user_id" uuid PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "reason" text NOT NULL,
  "discovery_source" text NOT NULL,
  "goal" text NOT NULL,
  "completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
