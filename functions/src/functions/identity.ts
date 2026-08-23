import { onCall, HttpsError } from "firebase-functions/v2/https";
import { collections, Timestamp } from "../lib/firestore";
import { requireAuth } from "../lib/auth";
import { logActivity } from "../lib/activity";

interface CreateIdentityData {
  name: string;
  bio?: string;
  avatarUrl?: string;
}

export const createIdentity = onCall<CreateIdentityData>(async (request) => {
  const uid = requireAuth(request);
  const { name, bio = "", avatarUrl } = request.data ?? {};

  if (typeof name !== "string" || name.trim().length < 2 || name.length > 60) {
    throw new HttpsError("invalid-argument", "Name must be 2-60 characters.");
  }
  if (typeof bio !== "string" || bio.length > 500) {
    throw new HttpsError("invalid-argument", "Bio must be at most 500 characters.");
  }

  const ref = collections.identities().doc(uid);
  const existing = await ref.get();
  if (existing.exists) {
    throw new HttpsError("already-exists", "Identity already exists.");
  }

  const now = Timestamp.now();
  await ref.set({
    uid,
    name: name.trim(),
    bio,
    ...(avatarUrl ? { avatarUrl } : {}),
    verificationStatus: "unverified",
    reputationScore: 100,
    isPro: false,
    createdAt: now,
    updatedAt: now,
  });

  await collections.reputationScores().doc(uid).set({
    uid,
    score: 100,
    level: "new",
    totalEvents: 0,
    updatedAt: now,
  });

  await logActivity(uid, "identity_created", { name: name.trim() });
  return { ok: true };
});

interface UpdateIdentityData {
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

export const updateIdentity = onCall<UpdateIdentityData>(async (request) => {
  const uid = requireAuth(request);
  const { name, bio, avatarUrl } = request.data ?? {};

  const updates: Record<string, string | Timestamp> = { updatedAt: Timestamp.now() };

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 2 || name.length > 60) {
      throw new HttpsError("invalid-argument", "Name must be 2-60 characters.");
    }
    updates.name = name.trim();
  }
  if (bio !== undefined) {
    if (typeof bio !== "string" || bio.length > 500) {
      throw new HttpsError("invalid-argument", "Bio must be at most 500 characters.");
    }
    updates.bio = bio;
  }
  if (avatarUrl !== undefined) {
    if (typeof avatarUrl !== "string" || avatarUrl.length > 2048) {
      throw new HttpsError("invalid-argument", "Invalid avatar URL.");
    }
    updates.avatarUrl = avatarUrl;
  }

  const ref = collections.identities().doc(uid);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new HttpsError("not-found", "Identity does not exist. Create it first.");
  }

  await ref.update(updates);
  await logActivity(uid, "identity_updated", {});
  return { ok: true };
});

export const upgradeToPro = onCall(async (request) => {
  const uid = requireAuth(request);
  const ref = collections.identities().doc(uid);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new HttpsError("not-found", "Identity does not exist.");
  }
  // In production this would be gated on a successful Stripe subscription;
  // the Stripe webhook flips isPro on invoice.paid events.
  await ref.update({ isPro: true, updatedAt: Timestamp.now() });
  await collections.users().doc(uid).set(
    { isPro: true, updatedAt: Timestamp.now() },
    { merge: true }
  );
  return { ok: true };
});
