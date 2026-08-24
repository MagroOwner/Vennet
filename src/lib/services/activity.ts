import { and, count, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { activityLogs } from "@/lib/db/schema";
import type { ActivityType } from "@/lib/types";
import { runFraudScan } from "./fraud";

export async function logActivity(
  userId: string,
  type: ActivityType,
  metadata: Record<string, string | number | boolean> = {}
): Promise<void> {
  await db.insert(activityLogs).values({ userId, type, metadata });
  await runFraudScan(userId, type);
}

export async function countRecentActivity(
  userId: string,
  type: ActivityType,
  windowMinutes: number
): Promise<number> {
  const since = new Date(Date.now() - windowMinutes * 60_000);
  const [row] = await db
    .select({ value: count() })
    .from(activityLogs)
    .where(
      and(
        eq(activityLogs.userId, userId),
        eq(activityLogs.type, type),
        gte(activityLogs.createdAt, since)
      )
    );
  return Number(row?.value ?? 0);
}
