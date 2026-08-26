import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export const WEEKLY_AI_REQUEST_LIMIT = 20;

type UsageRow = { requests_used: number };

export async function consumeAiRequest(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const result = await db.execute<UsageRow>(sql`
    INSERT INTO ai_weekly_usage (user_id, week_started_at, requests_used, updated_at)
    VALUES (${userId}::uuid, date_trunc('week', now()), 1, now())
    ON CONFLICT (user_id) DO UPDATE
    SET
      requests_used = CASE
        WHEN ai_weekly_usage.week_started_at < date_trunc('week', now()) THEN 1
        ELSE ai_weekly_usage.requests_used + 1
      END,
      week_started_at = date_trunc('week', now()),
      updated_at = now()
    WHERE
      ai_weekly_usage.week_started_at < date_trunc('week', now())
      OR ai_weekly_usage.requests_used < ${WEEKLY_AI_REQUEST_LIMIT}
    RETURNING requests_used
  `);
  const row = result[0];
  return row ? { allowed: true, remaining: Math.max(0, WEEKLY_AI_REQUEST_LIMIT - row.requests_used) } : { allowed: false, remaining: 0 };
}

export async function refundAiRequest(userId: string): Promise<void> {
  await db.execute(sql`
    UPDATE ai_weekly_usage
    SET requests_used = GREATEST(0, requests_used - 1), updated_at = now()
    WHERE user_id = ${userId}::uuid
      AND week_started_at >= date_trunc('week', now())
  `);
}
