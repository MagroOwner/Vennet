"use server";

import { and, eq, gte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionError, failure } from "@/lib/action-error";
import { requireAdmin, requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reputationLogs, transactions } from "@/lib/db/schema";
import { raiseFraudSignal } from "@/lib/services/fraud";
import {
  applyReputationEvent,
  MAX_DAILY_DELTA_PER_PAIR,
  recalculateReputation,
} from "@/lib/services/reputation";
import type { ActionResult } from "@/lib/types";

const reviewSchema = z.object({
  targetUserId: z.string().uuid("targetUserId is required."),
  type: z.enum(["positive_review", "negative_review"]),
  reason: z.string().min(3, "Reason must be 3-300 characters.").max(300),
  relatedId: z.string().optional(),
});

export async function logReputationEvent(
  input: z.input<typeof reviewSchema>
): Promise<ActionResult<{ score: number }>> {
  try {
    const { userId: actorId } = await requireAuth();
    const data = reviewSchema.parse(input);

    if (data.targetUserId === actorId) {
      await raiseFraudSignal(
        actorId,
        "reputation_manipulation",
        "medium",
        "Attempted to review own identity"
      );
      throw new ActionError("You cannot review yourself.");
    }

    // Reviews must be backed by a transaction between the two users.
    const [tx] = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(
        and(
          eq(transactions.buyerId, actorId),
          eq(transactions.sellerId, data.targetUserId)
        )
      )
      .limit(1);
    if (!tx) {
      throw new ActionError("You can only review users you have transacted with.");
    }

    // Fraud prevention: cap daily influence from a single actor on a single target.
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [pair] = await db
      .select({
        total: sql<number>`coalesce(sum(abs(${reputationLogs.delta})), 0)::int`,
      })
      .from(reputationLogs)
      .where(
        and(
          eq(reputationLogs.userId, data.targetUserId),
          eq(reputationLogs.actorId, actorId),
          gte(reputationLogs.createdAt, since)
        )
      );
    if (Number(pair?.total ?? 0) >= MAX_DAILY_DELTA_PER_PAIR) {
      await raiseFraudSignal(
        actorId,
        "reputation_manipulation",
        "high",
        `Exceeded daily reputation influence cap on ${data.targetUserId}`
      );
      throw new ActionError("Daily review limit reached for this user.");
    }

    const score = await applyReputationEvent({
      userId: data.targetUserId,
      type: data.type,
      reason: data.reason,
      actorId,
      relatedId: data.relatedId,
    });

    revalidatePath(`/identity/${data.targetUserId}`);
    return { ok: true, score };
  } catch (error) {
    return failure(error);
  }
}

const targetSchema = z.object({ targetUserId: z.string().uuid("targetUserId is required.") });

export async function calculateReputation(
  input: z.input<typeof targetSchema>
): Promise<ActionResult<{ score: number }>> {
  try {
    await requireAdmin();
    const { targetUserId } = targetSchema.parse(input);
    const score = await recalculateReputation(targetUserId);
    revalidatePath("/admin");
    return { ok: true, score };
  } catch (error) {
    return failure(error);
  }
}

const adjustSchema = z.object({
  targetUserId: z.string().uuid("targetUserId is required."),
  delta: z
    .number()
    .int()
    .min(-500, "Delta must be within ±500.")
    .max(500, "Delta must be within ±500."),
  reason: z.string().min(3, "Reason is required."),
});

export async function adjustReputation(
  input: z.input<typeof adjustSchema>
): Promise<ActionResult<{ score: number }>> {
  try {
    const { userId: adminId } = await requireAdmin();
    const data = adjustSchema.parse(input);
    const score = await applyReputationEvent({
      userId: data.targetUserId,
      type: "admin_adjustment",
      reason: data.reason,
      actorId: adminId,
      deltaOverride: data.delta,
    });
    revalidatePath("/admin");
    return { ok: true, score };
  } catch (error) {
    return failure(error);
  }
}
