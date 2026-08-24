import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { identities, reputationLogs, reputationScores } from "@/lib/db/schema";
import type { ReputationEventType, ReputationLevel } from "@/lib/types";

export const EVENT_DELTAS: Record<ReputationEventType, number> = {
  sale_completed: 10,
  purchase_completed: 3,
  positive_review: 5,
  negative_review: -5,
  dispute_opened: -2,
  dispute_lost: -15,
  dispute_won: 5,
  verification_approved: 20,
  fraud_flag: -25,
  admin_adjustment: 0,
};

const MIN_SCORE = 0;
const MAX_SCORE = 1000;
export const BASE_SCORE = 100;

/** Fraud prevention: cap how much a single counterparty pair can move a score per day. */
export const MAX_DAILY_DELTA_PER_PAIR = 20;

export function levelForScore(score: number): ReputationLevel {
  if (score >= 750) return "platinum";
  if (score >= 500) return "gold";
  if (score >= 300) return "silver";
  if (score >= 150) return "bronze";
  return "new";
}

function clamp(score: number): number {
  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, score));
}

export interface ReputationEventInput {
  userId: string;
  type: ReputationEventType;
  reason: string;
  actorId: string;
  relatedId?: string;
  deltaOverride?: number;
}

export async function applyReputationEvent(input: ReputationEventInput): Promise<number> {
  const delta = input.deltaOverride ?? EVENT_DELTAS[input.type];

  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(reputationScores)
      .where(eq(reputationScores.userId, input.userId))
      .for("update")
      .limit(1);

    const current = existing?.score ?? BASE_SCORE;
    const totalEvents = existing?.totalEvents ?? 0;
    const next = clamp(current + delta);

    await tx
      .insert(reputationScores)
      .values({
        userId: input.userId,
        score: next,
        level: levelForScore(next),
        totalEvents: totalEvents + 1,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: reputationScores.userId,
        set: {
          score: next,
          level: levelForScore(next),
          totalEvents: totalEvents + 1,
          updatedAt: new Date(),
        },
      });

    await tx.insert(reputationLogs).values({
      userId: input.userId,
      type: input.type,
      delta,
      reason: input.reason,
      relatedId: input.relatedId ?? null,
      actorId: input.actorId,
    });

    await tx
      .update(identities)
      .set({ reputationScore: next, updatedAt: new Date() })
      .where(eq(identities.userId, input.userId));

    return next;
  });
}

/** Recompute a user's score from their full log history. */
export async function recalculateReputation(userId: string): Promise<number> {
  const [totals] = await db
    .select({
      delta: sql<number>`coalesce(sum(${reputationLogs.delta}), 0)::int`,
      events: sql<number>`count(*)::int`,
    })
    .from(reputationLogs)
    .where(eq(reputationLogs.userId, userId));

  const score = clamp(BASE_SCORE + Number(totals?.delta ?? 0));
  const totalEvents = Number(totals?.events ?? 0);

  await db
    .insert(reputationScores)
    .values({
      userId,
      score,
      level: levelForScore(score),
      totalEvents,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: reputationScores.userId,
      set: { score, level: levelForScore(score), totalEvents, updatedAt: new Date() },
    });

  await db
    .update(identities)
    .set({ reputationScore: score, updatedAt: new Date() })
    .where(eq(identities.userId, userId));

  return score;
}
