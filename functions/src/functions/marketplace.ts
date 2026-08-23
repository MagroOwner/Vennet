import { onCall, HttpsError } from "firebase-functions/v2/https";
import { collections, db, FieldValue, Timestamp } from "../lib/firestore";
import { requireAuth } from "../lib/auth";
import { logActivity } from "../lib/activity";
import { raiseFraudSignal, countRecentActivity } from "../lib/fraud";
import { applyReputationEvent } from "../lib/reputation";
import { getStripe, PLATFORM_FEE_BPS, stripeSecretKey } from "../lib/stripe";
import type { ListingCategory } from "../types";

const CATEGORIES: ListingCategory[] = [
  "electronics", "fashion", "home", "services",
  "digital", "collectibles", "vehicles", "other",
];

interface CreateListingData {
  title: string;
  description: string;
  category: ListingCategory;
  priceCents: number;
  imageUrls?: string[];
}

export const createListing = onCall<CreateListingData>(async (request) => {
  const uid = requireAuth(request);
  const { title, description, category, priceCents, imageUrls = [] } = request.data ?? {};

  if (typeof title !== "string" || title.trim().length < 3 || title.length > 120) {
    throw new HttpsError("invalid-argument", "Title must be 3-120 characters.");
  }
  if (typeof description !== "string" || description.length < 10 || description.length > 5000) {
    throw new HttpsError("invalid-argument", "Description must be 10-5000 characters.");
  }
  if (!CATEGORIES.includes(category)) {
    throw new HttpsError("invalid-argument", "Invalid category.");
  }
  if (!Number.isInteger(priceCents) || priceCents < 100 || priceCents > 100_000_00) {
    throw new HttpsError("invalid-argument", "Price must be between $1 and $100,000.");
  }
  if (!Array.isArray(imageUrls) || imageUrls.length > 8 ||
      imageUrls.some((u) => typeof u !== "string" || u.length > 2048)) {
    throw new HttpsError("invalid-argument", "Up to 8 valid image URLs allowed.");
  }

  const identity = await collections.identities().doc(uid).get();
  if (!identity.exists) {
    throw new HttpsError("failed-precondition", "Create a Vennet identity before selling.");
  }

  // Fraud check: rapid listing creation
  const recentListings = await countRecentActivity(uid, "listing_created", 10);
  if (recentListings >= 5) {
    await raiseFraudSignal(uid, "rapid_listing_creation", "medium",
      `${recentListings} listings created within 10 minutes`);
    throw new HttpsError("resource-exhausted", "Too many listings created recently.");
  }

  const now = Timestamp.now();
  const ref = await collections.listings().add({
    sellerId: uid,
    title: title.trim(),
    description,
    category,
    priceCents,
    currency: "usd",
    imageUrls,
    status: "active",
    purchaseCount: 0,
    createdAt: now,
    updatedAt: now,
  });

  await logActivity(uid, "listing_created", { listingId: ref.id });
  return { ok: true, listingId: ref.id };
});

interface PurchaseListingData {
  listingId: string;
}

export const purchaseListing = onCall<PurchaseListingData>(
  { secrets: [stripeSecretKey] },
  async (request) => {
  const uid = requireAuth(request);
  const { listingId } = request.data ?? {};
  if (typeof listingId !== "string" || !listingId) {
    throw new HttpsError("invalid-argument", "listingId is required.");
  }

  const listingRef = collections.listings().doc(listingId);
  const listingSnap = await listingRef.get();
  if (!listingSnap.exists) {
    throw new HttpsError("not-found", "Listing not found.");
  }
  const listing = listingSnap.data()!;

  if (listing.status !== "active") {
    throw new HttpsError("failed-precondition", "Listing is not available.");
  }
  if (listing.sellerId === uid) {
    await raiseFraudSignal(uid, "self_purchase_attempt", "high",
      `Attempted to purchase own listing ${listingId}`);
    throw new HttpsError("permission-denied", "You cannot purchase your own listing.");
  }

  const recentPurchases = await countRecentActivity(uid, "listing_purchased", 10);
  if (recentPurchases >= 10) {
    await raiseFraudSignal(uid, "rapid_purchases", "medium",
      `${recentPurchases} purchases within 10 minutes`);
    throw new HttpsError("resource-exhausted", "Too many purchases recently.");
  }

  const sellerAccount = await collections.stripeAccounts().doc(listing.sellerId).get();
  if (!sellerAccount.exists || !sellerAccount.data()!.chargesEnabled) {
    throw new HttpsError("failed-precondition", "Seller has not completed Stripe onboarding.");
  }

  const platformFeeCents = Math.round((listing.priceCents * PLATFORM_FEE_BPS) / 10_000);
  const now = Timestamp.now();

  const txRef = collections.transactions().doc();
  await txRef.set({
    listingId,
    buyerId: uid,
    sellerId: listing.sellerId,
    amountCents: listing.priceCents,
    platformFeeCents,
    currency: listing.currency,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });

  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: listing.priceCents,
    currency: listing.currency,
    application_fee_amount: platformFeeCents,
    transfer_data: { destination: sellerAccount.data()!.stripeAccountId },
    metadata: { transactionId: txRef.id, listingId, buyerId: uid },
  });

  await txRef.update({
    stripePaymentIntentId: paymentIntent.id,
    updatedAt: Timestamp.now(),
  });

    await logActivity(uid, "listing_purchased", { listingId, transactionId: txRef.id });
    return {
      ok: true,
      transactionId: txRef.id,
      clientSecret: paymentIntent.client_secret,
    };
  }
);

/** Marks a transaction paid (called by the Stripe webhook, exported for reuse). */
export async function completeTransaction(transactionId: string): Promise<void> {
  await db.runTransaction(async (tx) => {
    const txRef = collections.transactions().doc(transactionId);
    const snap = await tx.get(txRef);
    if (!snap.exists) return;
    const data = snap.data()!;
    if (data.status !== "pending") return;

    tx.update(txRef, { status: "paid", updatedAt: Timestamp.now() });
    tx.update(collections.listings().doc(data.listingId), {
      status: "sold",
      purchaseCount: FieldValue.increment(1),
      updatedAt: Timestamp.now(),
    });
  });

  const snap = await collections.transactions().doc(transactionId).get();
  const data = snap.data();
  if (!data) return;
  await applyReputationEvent({
    uid: data.sellerId,
    type: "sale_completed",
    reason: `Sale completed for listing ${data.listingId}`,
    actorUid: "system",
    relatedId: transactionId,
  });
  await applyReputationEvent({
    uid: data.buyerId,
    type: "purchase_completed",
    reason: `Purchase completed for listing ${data.listingId}`,
    actorUid: "system",
    relatedId: transactionId,
  });
}
