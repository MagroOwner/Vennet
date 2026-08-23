import { onCall, HttpsError } from "firebase-functions/v2/https";
import { requireAuth, requireAdmin } from "../lib/auth";
import {
  applyReputationEvent,
  recalculateReputation,
  EVENT_DELTAS,
  MAX_DAILY_DELTA_PER_PAIR,
} from "../lib/reputation";
import { collections, Timestamp } from "../lib/firestore";
import { raiseFraudSignal } from "../lib/fraud";
import type { ReputationEventType } from "../types";

interface LogReputationEventData {
  targetUid: string;
  type: ReputationEventType;
  reason: string;
  relatedId?: string;
}

const USER_ALLOWED_EVENTS: ReputationEventType[] = [
  "positive_review",
  "negative_review",
];

export const logReputationEvent = onCall<LogReputationEventData>(async (request) => {
  const actorUid = requireAuth(request);
  const { targetUid, type, reason, relatedId } = request.data ?? {};

  if (typeof targetUid !== "string" || !targetUid) {
    throw new HttpsError("invalid-argument", "targetUid is required.");
  }
  if (!(type in EVENT_DELTAS)) {
    throw new HttpsError("invalid-argument", "Unknown event type.");
  }
  if (typeof reason !== "string" || reason.length < 3 || reason.length > 300) {
    throw new HttpsError("invalid-argument", "Reason must be 3-300 characters.");
  }
  if (!USER_ALLOWED_EVENTS.includes(type)) {
    throw new HttpsError("permission-denied", "This event type is system-generated.");
  }
  if (targetUid === actorUid) {
    await raiseFraudSignal(actorUid, "reputation_manipulation", "medium",
      "Attempted to review own identity");
    throw new HttpsError("permission-denied", "You cannot review yourself.");
  }

  // Reviews must be backed by a completed transaction between the two users
  const tx = await collections
    .transactions()
    .where("buyerId", "==", actorUid)
    .where("sellerId", "==", targetUid)
    .limit(1)
    .get();
  if (tx.empty) {
    throw new HttpsError(
      "failed-precondition",
      "You can only review users you have transacted with."
    );
  }

  // Fraud prevention: cap daily influence from a single actor on a single target
  const since = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);
  const recent = await collections
    .reputationLogs()
    .where("uid", "==", targetUid)
    .where("createdAt", ">=", since)
    .get();
  const pairDelta = recent.docs
    .filter((d) => d.data().actorUid === actorUid)
    .reduce((sum, d) => sum + Math.abs(d.data().delta), 0);
  if (pairDelta >= MAX_DAILY_DELTA_PER_PAIR) {
    await raiseFraudSignal(actorUid, "reputation_manipulation", "high",
      `Exceeded daily reputation influence cap on ${targetUid}`);
    throw new HttpsError("resource-exhausted", "Daily review limit reached for this user.");
  }

  const score = await applyReputationEvent({
    uid: targetUid,
    type,
    reason,
    actorUid,
    relatedId,
  });
  return { ok: true, score };
});

interface CalculateReputationData {
  targetUid: string;
}

export const calculateReputation = onCall<CalculateReputationData>(async (request) => {
  await requireAdmin(request);
  const { targetUid } = request.data ?? {};
  if (typeof targetUid !== "string" || !targetUid) {
    throw new HttpsError("invalid-argument", "targetUid is required.");
  }
  const score = await recalculateReputation(targetUid);
  return { ok: true, score };
});

interface AdjustReputationData {
  targetUid: string;
  delta: number;
  reason: string;
}

export const adjustReputation = onCall<AdjustReputationData>(async (request) => {
  const adminUid = await requireAdmin(request);
  const { targetUid, delta, reason } = request.data ?? {};
  if (typeof targetUid !== "string" || !targetUid) {
    throw new HttpsError("invalid-argument", "targetUid is required.");
  }
  if (typeof delta !== "number" || !Number.isFinite(delta) || Math.abs(delta) > 500) {
    throw new HttpsError("invalid-argument", "Delta must be a number within ±500.");
  }
  if (typeof reason !== "string" || reason.length < 3) {
    throw new HttpsError("invalid-argument", "Reason is required.");
  }
  const score = await applyReputationEvent({
    uid: targetUid,
    type: "admin_adjustment",
    reason,
    actorUid: adminUid,
    deltaOverride: delta,
  });
  return { ok: true, score };
});
