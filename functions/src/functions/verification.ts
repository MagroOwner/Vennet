import { onCall, HttpsError } from "firebase-functions/v2/https";
import { collections, Timestamp } from "../lib/firestore";
import { requireAuth, requireModerator } from "../lib/auth";
import { logActivity } from "../lib/activity";
import { applyReputationEvent } from "../lib/reputation";

interface SubmitVerificationData {
  fullName: string;
  documentType: "passport" | "drivers_license" | "national_id";
  documentPaths: string[];
}

const DOC_TYPES = ["passport", "drivers_license", "national_id"] as const;

export const submitVerification = onCall<SubmitVerificationData>(async (request) => {
  const uid = requireAuth(request);
  const { fullName, documentType, documentPaths } = request.data ?? {};

  if (typeof fullName !== "string" || fullName.trim().length < 2 || fullName.length > 120) {
    throw new HttpsError("invalid-argument", "Full name must be 2-120 characters.");
  }
  if (!DOC_TYPES.includes(documentType)) {
    throw new HttpsError("invalid-argument", "Invalid document type.");
  }
  if (
    !Array.isArray(documentPaths) ||
    documentPaths.length < 1 ||
    documentPaths.length > 4 ||
    documentPaths.some(
      (p) => typeof p !== "string" || !p.startsWith(`verificationDocs/${uid}/`)
    )
  ) {
    throw new HttpsError("invalid-argument", "1-4 document paths under your own folder required.");
  }

  const identity = await collections.identities().doc(uid).get();
  if (!identity.exists) {
    throw new HttpsError("failed-precondition", "Create a Vennet identity first.");
  }
  if (identity.data()!.verificationStatus === "verified") {
    throw new HttpsError("already-exists", "You are already verified.");
  }

  const pending = await collections
    .verificationRequests()
    .where("uid", "==", uid)
    .where("status", "==", "pending")
    .limit(1)
    .get();
  if (!pending.empty) {
    throw new HttpsError("already-exists", "A verification request is already pending.");
  }

  const now = Timestamp.now();
  const ref = await collections.verificationRequests().add({
    uid,
    fullName: fullName.trim(),
    documentType,
    documentPaths,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });

  await collections.identities().doc(uid).update({
    verificationStatus: "pending",
    updatedAt: now,
  });

  await logActivity(uid, "verification_submitted", { requestId: ref.id });
  return { ok: true, requestId: ref.id };
});

interface ApproveVerificationData {
  requestId: string;
  approve: boolean;
  reviewNote?: string;
}

export const approveVerification = onCall<ApproveVerificationData>(async (request) => {
  const adminUid = await requireModerator(request);
  const { requestId, approve, reviewNote = "" } = request.data ?? {};

  if (typeof requestId !== "string" || !requestId) {
    throw new HttpsError("invalid-argument", "requestId is required.");
  }
  if (typeof approve !== "boolean") {
    throw new HttpsError("invalid-argument", "approve must be a boolean.");
  }

  const ref = collections.verificationRequests().doc(requestId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new HttpsError("not-found", "Verification request not found.");
  }
  const req = snap.data()!;
  if (req.status !== "pending") {
    throw new HttpsError("failed-precondition", "Request already reviewed.");
  }

  const now = Timestamp.now();
  await ref.update({
    status: approve ? "approved" : "rejected",
    reviewedBy: adminUid,
    reviewNote,
    updatedAt: now,
  });

  await collections.identities().doc(req.uid).update({
    verificationStatus: approve ? "verified" : "rejected",
    updatedAt: now,
  });

  if (approve) {
    await applyReputationEvent({
      uid: req.uid,
      type: "verification_approved",
      reason: "Identity verification approved",
      actorUid: adminUid,
      relatedId: requestId,
    });
  }

  return { ok: true };
});
