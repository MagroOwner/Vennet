import { and, desc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  disputes,
  fraudSignals,
  identities,
  listings,
  reputationLogs,
  reputationScores,
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
