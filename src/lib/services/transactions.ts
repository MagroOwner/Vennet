import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { listings, transactions } from "@/lib/db/schema";
import { applyReputationEvent } from "./reputation";

/** Marks a pending transaction paid and awards reputation. Called by the Stripe webhook. */
export async function completeTransaction(transactionId: string): Promise<void> {
  const transaction = await db.transaction(async (tx) => {
    const [current] = await tx
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .for("update")
      .limit(1);
    if (!current || current.status !== "pending") return null;

    await tx
      .update(transactions)
      .set({ status: "paid", updatedAt: new Date() })
      .where(eq(transactions.id, transactionId));
    await tx
      .update(listings)
      .set({
        status: "sold",
        purchaseCount: sql`${listings.purchaseCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(listings.id, current.listingId));

    return current;
  });

  if (!transaction) return;

  await applyReputationEvent({
    userId: transaction.sellerId,
    type: "sale_completed",
    reason: `Sale completed for listing ${transaction.listingId}`,
    actorId: "system",
    relatedId: transactionId,
  });
  await applyReputationEvent({
    userId: transaction.buyerId,
    type: "purchase_completed",
    reason: `Purchase completed for listing ${transaction.listingId}`,
    actorId: "system",
    relatedId: transactionId,
  });
}
