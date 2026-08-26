CREATE TABLE IF NOT EXISTS "ai_weekly_usage" (
  "user_id" uuid PRIMARY KEY REFERENCES "users"("id") ON DELETE cascade,
  "week_started_at" timestamp with time zone NOT NULL,
  "requests_used" integer NOT NULL DEFAULT 0,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);