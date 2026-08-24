import { and, count, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { activityLogs, fraudSignals } from "@/lib/db/schema";
import type { ActivityType, FraudSignalType } from "@/lib/types";

export async function raiseFraudSignal(
  userId: string,
  type: FraudSignalType,
  severity: "low" | "medium" | "high",
  details: string
): Promise<void> {
  await db.insert(fraudSignals).values({ userId, type, severity, details });
}

const HOURLY_THRESHOLDS: Partial<
  Record<ActivityType, { limit: number; signal: FraudSignalType; severity: "medium" | "high" }>
> = {
  listing_created: { limit: 15, signal: "rapid_listing_creation", severity: "high" },
  listing_purchased: { limit: 20, signal: "rapid_purchases", severity: "high" },
  dispute_created: { limit: 3, signal: "excessive_disputes", severity: "medium" },
};

/**
 * Rule-based fraud detection, run after every activity log write. Replaces the
 * Firestore onCreate trigger; raises fraudSignals rows for the admin dashboard.
 */
export async function runFraudScan(userId: string, type: ActivityType): Promise<void> {
  const rule = HOURLY_THRESHOLDS[type];
  if (!rule) return;

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [row] = await db
    .select({ value: count() })
    .from(activityLogs)
    .where(
      and(
        eq(activityLogs.userId, userId),
        eq(activityLogs.type, type),
        gte(activityLogs.createdAt, hourAgo)
      )
    );

  const total = Number(row?.value ?? 0);
  if (total > rule.limit) {
    await raiseFraudSignal(
      userId,
      rule.signal,
      rule.severity,
      `${total} ${type} events within an hour`
    );
  }
}
