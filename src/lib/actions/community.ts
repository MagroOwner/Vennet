"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionError, failure } from "@/lib/action-error";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { creatorFollows, listingBundles, listingReviews, listings, priceAlerts, purchaseMessages, referralCodes, savedListings, sellerCoupons, transactions } from "@/lib/db/schema";
import type { ActionResult } from "@/lib/types";

export async function toggleSavedListing(listingId: string): Promise<ActionResult<{ saved: boolean }>> {
  try {
    const { userId } = await requireAuth();
    const [existing] = await db.select().from(savedListings).where(and(eq(savedListings.userId, userId), eq(savedListings.listingId, listingId))).limit(1);
    if (existing) {
      await db.delete(savedListings).where(and(eq(savedListings.userId, userId), eq(savedListings.listingId, listingId)));
      return { ok: true, saved: false };
    }
    await db.insert(savedListings).values({ userId, listingId });
    return { ok: true, saved: true };
  } catch (error) { return failure(error); }
}

export async function toggleCreatorFollow(creatorId: string): Promise<ActionResult<{ following: boolean }>> {
  try {
    const { userId } = await requireAuth();
    if (creatorId === userId) throw new ActionError("You cannot follow your own profile.");
    const [existing] = await db.select().from(creatorFollows).where(and(eq(creatorFollows.followerId, userId), eq(creatorFollows.creatorId, creatorId))).limit(1);
    if (existing) {
      await db.delete(creatorFollows).where(and(eq(creatorFollows.followerId, userId), eq(creatorFollows.creatorId, creatorId)));
      return { ok: true, following: false };
    }
    await db.insert(creatorFollows).values({ followerId: userId, creatorId });
    return { ok: true, following: true };
  } catch (error) { return failure(error); }
}

const reviewSchema = z.object({ transactionId: z.string().uuid(), rating: z.number().int().min(1).max(5), body: z.string().trim().max(1500).default("") });

export async function createVerifiedReview(input: z.input<typeof reviewSchema>): Promise<ActionResult> {
  try {
    const { userId } = await requireAuth();
    const data = reviewSchema.parse(input);
    const [sale] = await db.select().from(transactions).where(and(eq(transactions.id, data.transactionId), eq(transactions.buyerId, userId), eq(transactions.status, "paid"))).limit(1);
    if (!sale) throw new ActionError("Only verified buyers can leave a review.");
    const [existing] = await db.select({ id: listingReviews.id }).from(listingReviews).where(eq(listingReviews.transactionId, sale.id)).limit(1);
    if (existing) throw new ActionError("You have already reviewed this purchase.");
    await db.insert(listingReviews).values({ transactionId: sale.id, listingId: sale.listingId, buyerId: userId, sellerId: sale.sellerId, rating: data.rating, body: data.body });
    revalidatePath("/marketplace/" + sale.listingId);
    return { ok: true };
  } catch (error) { return failure(error); }
}

const messageSchema = z.object({ transactionId: z.string().uuid(), body: z.string().trim().min(1).max(3000) });

export async function sendPurchaseMessage(input: z.input<typeof messageSchema>): Promise<ActionResult> {
  try {
    const { userId } = await requireAuth();
    const data = messageSchema.parse(input);
    const [sale] = await db.select().from(transactions).where(eq(transactions.id, data.transactionId)).limit(1);
    if (!sale || (sale.buyerId !== userId && sale.sellerId !== userId)) throw new ActionError("You do not have access to this purchase conversation.");
    await db.insert(purchaseMessages).values({ transactionId: sale.id, senderId: userId, body: data.body });
    revalidatePath("/inventory");
    revalidatePath("/dashboard/seller");
    return { ok: true };
  } catch (error) { return failure(error); }
}

const couponSchema = z.object({ code: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,32}$/), discountPercent: z.number().int().min(1).max(80), expiresAt: z.string().datetime().optional() });

export async function createSellerCoupon(input: z.input<typeof couponSchema>): Promise<ActionResult> {
  try {
    const { userId } = await requireAuth();
    const data = couponSchema.parse(input);
    await db.insert(sellerCoupons).values({ sellerId: userId, code: data.code, discountPercent: data.discountPercent, expiresAt: data.expiresAt ? new Date(data.expiresAt) : null });
    revalidatePath("/dashboard/seller");
    return { ok: true };
  } catch (error) { return failure(error); }
}

export async function createReferralCode(): Promise<ActionResult<{ code: string }>> {
  try {
    const { userId } = await requireAuth();
    const [existing] = await db.select().from(referralCodes).where(eq(referralCodes.userId, userId)).limit(1);
    if (existing) return { ok: true, code: existing.code };
    const code = "VEN-" + crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
    await db.insert(referralCodes).values({ userId, code });
    revalidatePath("/dashboard/seller");
    return { ok: true, code };
  } catch (error) { return failure(error); }
}

export async function togglePriceAlert(listingId: string): Promise<ActionResult<{ enabled: boolean }>> {
  try {
    const { userId } = await requireAuth();
    const [existing] = await db.select().from(priceAlerts).where(and(eq(priceAlerts.userId, userId), eq(priceAlerts.listingId, listingId))).limit(1);
    if (existing) {
      await db.delete(priceAlerts).where(and(eq(priceAlerts.userId, userId), eq(priceAlerts.listingId, listingId)));
      return { ok: true, enabled: false };
    }
    await db.insert(priceAlerts).values({ userId, listingId });
    return { ok: true, enabled: true };
  } catch (error) { return failure(error); }
}

const replySchema = z.object({ reviewId: z.string().uuid(), reply: z.string().trim().min(1).max(1500) });
export async function replyToReview(input: z.input<typeof replySchema>): Promise<ActionResult> {
  try {
    const { userId } = await requireAuth();
    const data = replySchema.parse(input);
    const [review] = await db.select().from(listingReviews).where(and(eq(listingReviews.id, data.reviewId), eq(listingReviews.sellerId, userId))).limit(1);
    if (!review) throw new ActionError("You can only reply to reviews on your own listings.");
    await db.update(listingReviews).set({ sellerReply: data.reply, sellerRepliedAt: new Date() }).where(eq(listingReviews.id, review.id));
    revalidatePath("/marketplace/" + review.listingId);
    return { ok: true };
  } catch (error) { return failure(error); }
}

const bundleSchema = z.object({ name: z.string().trim().min(3).max(100), description: z.string().trim().max(1000).default(""), listingIds: z.array(z.string().uuid()).min(2).max(6), discountPercent: z.number().int().min(5).max(60), expiresAt: z.string().datetime().optional() });
export async function createSellerBundle(input: z.input<typeof bundleSchema>): Promise<ActionResult<{ bundleId: string }>> {
  try {
    const { userId } = await requireAuth();
    const data = bundleSchema.parse(input);
    const ownListings = await db.select({ id: listings.id }).from(listings).where(and(eq(listings.sellerId, userId), inArray(listings.id, data.listingIds), eq(listings.status, "active")));
    if (ownListings.length !== data.listingIds.length) throw new ActionError("A bundle can only include your active listings.");
    const [bundle] = await db.insert(listingBundles).values({ sellerId: userId, name: data.name, description: data.description, listingIds: data.listingIds, discountPercent: data.discountPercent, expiresAt: data.expiresAt ? new Date(data.expiresAt) : null }).returning({ id: listingBundles.id });
    revalidatePath("/dashboard/seller");
    return { ok: true, bundleId: bundle.id };
  } catch (error) { return failure(error); }
}
