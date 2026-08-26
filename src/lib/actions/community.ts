"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionError, failure } from "@/lib/action-error";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { creatorFollows, listingReviews, purchaseMessages, savedListings, sellerCoupons, transactions } from "@/lib/db/schema";
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

const couponSchema = z.object({ code: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,32}$/), discountPercent: z.number().int().min(1).max(80) });

export async function createSellerCoupon(input: z.input<typeof couponSchema>): Promise<ActionResult> {
  try {
    const { userId } = await requireAuth();
    const data = couponSchema.parse(input);
    await db.insert(sellerCoupons).values({ sellerId: userId, code: data.code, discountPercent: data.discountPercent });
    revalidatePath("/dashboard/seller");
    return { ok: true };
  } catch (error) { return failure(error); }
}
