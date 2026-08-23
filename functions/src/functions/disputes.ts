import { onCall, HttpsError } from "firebase-functions/v2/https";
import { collections, Timestamp } from "../lib/firestore";
import { requireAuth, requireModerator } from "../lib/auth";
import { logActivity } from "../lib/activity";
import { raiseFraudSignal } from "../lib/fraud";
import { applyReputationEvent } from "../lib/reputation";
import type { DisputeStatus } from "../types";

interface CreateDisputeData {
  transactionId: string;
  reason: string;
}

export const createDispute = onCall<CreateDisputeData>(async (request) => {
  const uid = requireAuth(request);
  const { transactionId, reason } = request.data ?? {};

  if (typeof transactionId !== "string" || !transactionId) {
    throw new HttpsError("invalid-argument", "transactionId is required.");
  }
  if (typeof reason !== "string" || reason.length < 10 || reason.length > 2000) {
    throw new HttpsError("invalid-argument", "Reason must be 10-2000 characters.");
  }

  const txSnap = await collections.transactions().doc(transactionId).get();
  if (!txSnap.exists) {
    throw new HttpsError("not-found", "Transaction not found.");
  }
  const tx = txSnap.data()!;
  if (tx.buyerId !== uid) {
    throw new HttpsError("permission-denied", "Only the buyer can open a dispute.");
  }
  if (tx.status !== "paid" && tx.status !== "paid_out" && tx.status !== "payout_pending") {
    throw new HttpsError("failed-precondition", "Transaction is not disputable.");
  }

  const existing = await collections
    .disputes()
    .where("transactionId", "==", transactionId)
    .limit(1)
    .get();
  if (!existing.empty) {
    throw new HttpsError("already-exists", "A dispute already exists for this transaction.");
  }

  // Fraud check: excessive disputes from one buyer
  const since = Timestamp.fromMillis(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recent = await collections
    .disputes()
    .where("buyerId", "==", uid)
    .where("createdAt", ">=", since)
    .get();
  if (recent.size >= 5) {
    await raiseFraudSignal(uid, "excessive_disputes", "high",
      `${recent.size} disputes opened in the last 30 days`);
  }

  const now = Timestamp.now();
  const ref = await collections.disputes().add({
    transactionId,
    listingId: tx.listingId,
    buyerId: uid,
    sellerId: tx.sellerId,
    reason,
    status: "open",
    messages: [],
    createdAt: now,
    updatedAt: now,
  });

  await collections.transactions().doc(transactionId).update({
    status: "disputed",
    updatedAt: now,
  });

  await applyReputationEvent({
    uid: tx.sellerId,
    type: "dispute_opened",
    reason: `Dispute opened on transaction ${transactionId}`,
    actorUid: uid,
    relatedId: ref.id,
  });

  await logActivity(uid, "dispute_created", { disputeId: ref.id, transactionId });
  return { ok: true, disputeId: ref.id };
});

interface ResolveDisputeData {
  disputeId: string;
  outcome: "resolved_buyer" | "resolved_seller" | "dismissed";
  resolution: string;
}

export const resolveDispute = onCall<ResolveDisputeData>(async (request) => {
  const adminUid = await requireModerator(request);
  const { disputeId, outcome, resolution } = request.data ?? {};

  const validOutcomes: DisputeStatus[] = ["resolved_buyer", "resolved_seller", "dismissed"];
  if (typeof disputeId !== "string" || !disputeId) {
    throw new HttpsError("invalid-argument", "disputeId is required.");
  }
  if (!validOutcomes.includes(outcome)) {
    throw new HttpsError("invalid-argument", "Invalid outcome.");
  }
  if (typeof resolution !== "string" || resolution.length < 5) {
    throw new HttpsError("invalid-argument", "Resolution note is required.");
  }

  const ref = collections.disputes().doc(disputeId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new HttpsError("not-found", "Dispute not found.");
  }
  const dispute = snap.data()!;
  if (dispute.status !== "open" && dispute.status !== "under_review") {
    throw new HttpsError("failed-precondition", "Dispute already resolved.");
  }

  const now = Timestamp.now();
  await ref.update({
    status: outcome,
    resolution,
    resolvedBy: adminUid,
    updatedAt: now,
  });

  if (outcome === "resolved_buyer") {
    await collections.transactions().doc(dispute.transactionId).update({
      status: "refunded",
      updatedAt: now,
    });
    await applyReputationEvent({
      uid: dispute.sellerId,
      type: "dispute_lost",
      reason: `Dispute ${disputeId} resolved for buyer`,
      actorUid: adminUid,
      relatedId: disputeId,
    });
  } else if (outcome === "resolved_seller") {
    await collections.transactions().doc(dispute.transactionId).update({
      status: "paid",
      updatedAt: now,
    });
    await applyReputationEvent({
      uid: dispute.sellerId,
      type: "dispute_won",
      reason: `Dispute ${disputeId} resolved for seller`,
      actorUid: adminUid,
      relatedId: disputeId,
    });
  }

  return { ok: true };
});
