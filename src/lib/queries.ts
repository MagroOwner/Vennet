import { and, desc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  cartItems,
  creatorFollows,
  disputes,
  fraudSignals,
  identities,
  listingBundles,
  listingReviews,
  listings,
  notifications,
  notificationPreferences,
  purchaseMessages,
  reputationLogs,
  reputationScores,
  referralCodes,
  referrals,
  savedListings,
  roles,
  stripeAccounts,
  transactions,
  users,
  verificationRequests,
} from "@/lib/db/schema";
import type {
  Dispute,
  FraudSignal,
  Identity,
  Listing,
  ListingCategory,
  ReputationLog,
  ReputationScore,
  Role,
  StripeAccount,
  Transaction,
  User,
  VerificationRequest,
} from "@/lib/types";

export async function getUser(userId: string): Promise<User | null> {
  const [row] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return row ?? null;
}

export async function getIdentity(userId: string): Promise<Identity | null> {
  const [row] = await db
    .select()
    .from(identities)
    .where(eq(identities.userId, userId))
    .limit(1);
  return row ?? null;
}

export async function getRole(userId: string): Promise<Role> {
  const [row] = await db
    .select({ role: roles.role })
    .from(roles)
    .where(eq(roles.userId, userId))
    .limit(1);
  return row?.role ?? "user";
}

export async function getReputationScore(userId: string): Promise<ReputationScore | null> {
  const [row] = await db
    .select()
    .from(reputationScores)
    .where(eq(reputationScores.userId, userId))
    .limit(1);
  return row ?? null;
}

export async function getReputationLogs(userId: string, max = 50): Promise<ReputationLog[]> {
  return db
    .select()
    .from(reputationLogs)
    .where(eq(reputationLogs.userId, userId))
    .orderBy(desc(reputationLogs.createdAt))
    .limit(max);
}

export async function getActiveListings(
  category?: ListingCategory,
  max = 50
): Promise<Listing[]> {
  const where = category
    ? and(eq(listings.status, "active"), eq(listings.category, category))
    : eq(listings.status, "active");
  return db
    .select()
    .from(listings)
    .where(where)
    .orderBy(desc(listings.createdAt))
    .limit(max);
}

export async function getListing(id: string): Promise<Listing | null> {
  const [row] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
  return row ?? null;
}

export async function getSellerListings(sellerId: string): Promise<Listing[]> {
  return db
    .select()
    .from(listings)
    .where(eq(listings.sellerId, sellerId))
    .orderBy(desc(listings.createdAt));
}

export async function getPurchases(buyerId: string): Promise<Transaction[]> {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.buyerId, buyerId))
    .orderBy(desc(transactions.createdAt));
}

export async function getSales(sellerId: string): Promise<Transaction[]> {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.sellerId, sellerId))
    .orderBy(desc(transactions.createdAt));
}

export async function getMyDisputes(userId: string): Promise<Dispute[]> {
  return db
    .select()
    .from(disputes)
    .where(or(eq(disputes.buyerId, userId), eq(disputes.sellerId, userId)))
    .orderBy(desc(disputes.createdAt));
}

export async function getOpenDisputes(): Promise<Dispute[]> {
  return db
    .select()
    .from(disputes)
    .where(inArray(disputes.status, ["open", "under_review"]))
    .orderBy(desc(disputes.createdAt));
}

export async function getMyVerificationRequests(
  userId: string
): Promise<VerificationRequest[]> {
  return db
    .select()
    .from(verificationRequests)
    .where(eq(verificationRequests.userId, userId))
    .orderBy(desc(verificationRequests.createdAt));
}

export async function getPendingVerificationRequests(): Promise<VerificationRequest[]> {
  return db
    .select()
    .from(verificationRequests)
    .where(eq(verificationRequests.status, "pending"))
    .orderBy(desc(verificationRequests.createdAt));
}

export async function getStripeAccount(userId: string): Promise<StripeAccount | null> {
  const [row] = await db
    .select()
    .from(stripeAccounts)
    .where(eq(stripeAccounts.userId, userId))
    .limit(1);
  return row ?? null;
}

export async function getFraudSignals(max = 100): Promise<FraudSignal[]> {
  return db
    .select()
    .from(fraudSignals)
    .orderBy(desc(fraudSignals.createdAt))
    .limit(max);
}


export async function getSavedListings(userId: string): Promise<Listing[]> {
  const rows = await db
    .select({ listing: listings })
    .from(savedListings)
    .innerJoin(listings, eq(savedListings.listingId, listings.id))
    .where(eq(savedListings.userId, userId))
    .orderBy(desc(savedListings.createdAt));
  return rows.map((row) => row.listing);
}

export async function getListingReviews(listingId: string) {
  return db.select().from(listingReviews).where(and(eq(listingReviews.listingId, listingId), eq(listingReviews.hidden, false))).orderBy(desc(listingReviews.createdAt));
}

export async function getCreatorFollowerCount(creatorId: string): Promise<number> {
  const rows = await db.select({ followerId: creatorFollows.followerId }).from(creatorFollows).where(eq(creatorFollows.creatorId, creatorId));
  return rows.length;
}

export async function getUnreadNotifications(userId: string) {
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(20);
}

export async function getPurchaseMessages(transactionId: string) {
  return db.select().from(purchaseMessages).where(eq(purchaseMessages.transactionId, transactionId)).orderBy(purchaseMessages.createdAt);
}


export async function getSavedListingIds(userId: string): Promise<string[]> {
  const rows = await db.select({ listingId: savedListings.listingId }).from(savedListings).where(eq(savedListings.userId, userId));
  return rows.map((row) => row.listingId);
}

export async function getReferralCode(userId: string): Promise<string | null> {
  const [row] = await db.select({ code: referralCodes.code }).from(referralCodes).where(eq(referralCodes.userId, userId)).limit(1);
  return row?.code ?? null;
}

export async function getReferralStats(userId: string): Promise<{ signUps: number; qualified: number; rewardCents: number }> {
  const rows = await db.select().from(referrals).where(eq(referrals.referrerId, userId));
  return { signUps: rows.length, qualified: rows.filter((row) => row.status === "qualified").length, rewardCents: rows.reduce((total, row) => total + row.rewardCents, 0) };
}

export async function getFeaturedCreators(max = 6): Promise<Identity[]> {
  return db.select().from(identities).orderBy(desc(identities.reputationScore), desc(identities.createdAt)).limit(max);
}

export async function getListingSaveCount(listingId: string): Promise<number> {
  const rows = await db.select({ userId: savedListings.userId }).from(savedListings).where(eq(savedListings.listingId, listingId));
  return rows.length;
}

export type ListingTrust = { averageRating: number | null; reviewCount: number; sellerVerified: boolean };
export async function getListingTrust(listingRows: Listing[]): Promise<Record<string, ListingTrust>> {
  if (!listingRows.length) return {};
  const listingIds = listingRows.map((listing) => listing.id);
  const sellerIds = listingRows.map((listing) => listing.sellerId).filter((sellerId, index, all) => all.indexOf(sellerId) === index);
  const [reviewRows, sellerRows] = await Promise.all([
    db.select({ listingId: listingReviews.listingId, rating: listingReviews.rating }).from(listingReviews).where(and(inArray(listingReviews.listingId, listingIds), eq(listingReviews.hidden, false))),
    db.select({ userId: identities.userId, verificationStatus: identities.verificationStatus }).from(identities).where(inArray(identities.userId, sellerIds)),
  ]);
  const verifiedSellers = new Set(sellerRows.filter((seller) => seller.verificationStatus === "verified").map((seller) => seller.userId));
  return Object.fromEntries(listingRows.map((listing) => {
    const rows = reviewRows.filter((review) => review.listingId === listing.id);
    return [listing.id, { averageRating: rows.length ? rows.reduce((total, review) => total + review.rating, 0) / rows.length : null, reviewCount: rows.length, sellerVerified: verifiedSellers.has(listing.sellerId) }];
  }));
}

export async function getSellerBundles(sellerId: string) {
  return db.select().from(listingBundles).where(eq(listingBundles.sellerId, sellerId)).orderBy(desc(listingBundles.createdAt));
}

export async function getBundle(id: string) {
  const [bundle] = await db.select().from(listingBundles).where(eq(listingBundles.id, id)).limit(1);
  return bundle ?? null;
}

export async function getCartListings(userId: string): Promise<Listing[]> {
  const rows = await db.select({ listing: listings }).from(cartItems).innerJoin(listings, eq(cartItems.listingId, listings.id)).where(eq(cartItems.userId, userId)).orderBy(desc(cartItems.createdAt));
  return rows.map((row) => row.listing);
}

export async function getNotificationPreferences(userId: string) {
  const [row] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).limit(1);
  return row ?? { userId, priceDrops: true, creatorReleases: true, purchaseUpdates: true, productUpdates: true, updatedAt: new Date() };
}


export async function getCommunityStats(): Promise<{ total: number; pro: number; verified: number }> {
  const [members, proMembers, verifiedMembers] = await Promise.all([
    db.select({ id: users.id }).from(users).where(eq(users.disabled, false)),
    db.select({ id: users.id }).from(users).where(and(eq(users.disabled, false), eq(users.isPro, true))),
    db.select({ userId: identities.userId }).from(identities).where(eq(identities.verificationStatus, "verified")),
  ]);
  return { total: members.length, pro: proMembers.length, verified: verifiedMembers.length };
}
