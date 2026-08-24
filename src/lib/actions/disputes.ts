"use server";

import { and, count, eq, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionError, failure } from "@/lib/action-error";
import { requireAuth, requireModerator } from "@/lib/auth";
import { db } from "@/lib/db";
import { disputes, transactions } from "@/lib/db/schema";
import { logActivity } from "@/lib/services/activity";
import { raiseFraudSignal } from "@/lib/services/fraud";
import { applyReputationEvent } from "@/lib/services/reputation";
import { DISPUTE_OUTCOMES, type ActionResult } from "@/lib/types";

const createDisputeSchema = z.object({
  transactionId: z.string().uuid("transactionId is required."),
  reason: z
    .string()
    .min(10, "Reason must be 10-2000 characters.")
    .max(2000, "Reason must be 10-2000 characters."),
});

export async function createDispute(
  input: z.input<typeof createDisputeSchema>
): Promise<ActionResult<{ disputeId: string }>> {
  try {
    const { userId } = await requireAuth();
    const data = createDisputeSchema.parse(input);

    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, data.transactionId))
      .limit(1);
    if (!transaction) {
      throw new ActionError("Transaction not found.");
    }
    if (transaction.buyerId !== userId) {
      throw new ActionError("Only the buyer can open a dispute.");
    }
    if (!["paid", "paid_out", "payout_pending"].includes(transaction.status)) {
      throw new ActionError("Transaction is not disputable.");
    }

    const [existing] = await db
      .select({ id: disputes.id })
      .from(disputes)
      .where(eq(disputes.transactionId, data.transactionId))
      .limit(1);
    if (existing) {
      throw new ActionError("A dispute already exists for this transaction.");
    }

    // Fraud check: excessive disputes from one buyer.
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [recent] = await db
      .select({ value: count() })
      .from(disputes)
      .where(and(eq(disputes.buyerId, userId), gte(disputes.createdAt, since)));
    const recentCount = Number(recent?.value ?? 0);
    if (recentCount >= 5) {
      await raiseFraudSignal(
        userId,
        "excessive_disputes",
        "high",
        `${recentCount} disputes opened in the last 30 days`
      );
    }

    const dispute = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(disputes)
        .values({
          transactionId: data.transactionId,
          listingId: transaction.listingId,
          buyerId: userId,
          sellerId: transaction.sellerId,
          reason: data.reason,
          status: "open",
        })
        .returning({ id: disputes.id });

      await tx
        .update(transactions)
        .set({ status: "disputed", updatedAt: new Date() })
        .where(eq(transactions.id, data.transactionId));

      return created;
    });

    await applyReputationEvent({
      userId: transaction.sellerId,
      type: "dispute_opened",
      reason: `Dispute opened on transaction ${data.transactionId}`,
      actorId: userId,
      relatedId: dispute.id,
    });

    await logActivity(userId, "dispute_created", {
      disputeId: dispute.id,
      transactionId: data.transactionId,
    });
    revalidatePath("/disputes");
    return { ok: true, disputeId: dispute.id };
  } catch (error) {
    return failure(error);
  }
}

const resolveSchema = z.object({
  disputeId: z.string().uuid("disputeId is required."),
  outcome: z.enum(DISPUTE_OUTCOMES),
  resolution: z.string().min(5, "Resolution note is required."),
});

export async function resolveDispute(
  input: z.input<typeof resolveSchema>
): Promise<ActionResult> {
  try {
    const { userId: adminId } = await requireModerator();
    const data = resolveSchema.parse(input);

    const [dispute] = await db
      .select()
      .from(disputes)
      .where(eq(disputes.id, data.disputeId))
      .limit(1);
    if (!dispute) {
      throw new ActionError("Dispute not found.");
    }
    if (dispute.status !== "open" && dispute.status !== "under_review") {
      throw new ActionError("Dispute already resolved.");
    }

    await db.transaction(async (tx) => {
      await tx
        .update(disputes)
        .set({
          status: data.outcome,
          resolution: data.resolution,
          resolvedBy: adminId,
          updatedAt: new Date(),
        })
        .where(eq(disputes.id, data.disputeId));

      if (data.outcome === "resolved_buyer" || data.outcome === "resolved_seller") {
        await tx
          .update(transactions)
          .set({
            status: data.outcome === "resolved_buyer" ? "refunded" : "paid",
            updatedAt: new Date(),
          })
          .where(eq(transactions.id, dispute.transactionId));
      }
    });

    if (data.outcome === "resolved_buyer") {
      await applyReputationEvent({
        userId: dispute.sellerId,
        type: "dispute_lost",
        reason: `Dispute ${data.disputeId} resolved for buyer`,
        actorId: adminId,
        relatedId: data.disputeId,
      });
    } else if (data.outcome === "resolved_seller") {
      await applyReputationEvent({
        userId: dispute.sellerId,
        type: "dispute_won",
        reason: `Dispute ${data.disputeId} resolved for seller`,
        actorId: adminId,
        relatedId: data.disputeId,
      });
    }

    revalidatePath("/admin");
    revalidatePath("/disputes");
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}
