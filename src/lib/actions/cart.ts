"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ActionError, failure } from "@/lib/action-error";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cartItems, listings } from "@/lib/db/schema";
import type { ActionResult } from "@/lib/types";

export async function toggleCartItem(listingId: string): Promise<ActionResult<{ inCart: boolean }>> {
  try {
    const { userId } = await requireAuth();
    const [listing] = await db.select({ id: listings.id, sellerId: listings.sellerId, status: listings.status }).from(listings).where(eq(listings.id, listingId)).limit(1);
    if (!listing || listing.status !== "active") throw new ActionError("This offer is not available.");
    if (listing.sellerId === userId) throw new ActionError("You cannot add your own listing to a cart.");
    const [existing] = await db.select().from(cartItems).where(and(eq(cartItems.userId, userId), eq(cartItems.listingId, listingId))).limit(1);
    if (existing) {
      await db.delete(cartItems).where(and(eq(cartItems.userId, userId), eq(cartItems.listingId, listingId)));
      revalidatePath("/cart");
      return { ok: true, inCart: false };
    }
    await db.insert(cartItems).values({ userId, listingId });
    revalidatePath("/cart");
    return { ok: true, inCart: true };
  } catch (error) { return failure(error); }
}

export async function removeCartItem(listingId: string): Promise<ActionResult> {
  try {
    const { userId } = await requireAuth();
    await db.delete(cartItems).where(and(eq(cartItems.userId, userId), eq(cartItems.listingId, listingId)));
    revalidatePath("/cart");
    return { ok: true };
  } catch (error) { return failure(error); }
}
