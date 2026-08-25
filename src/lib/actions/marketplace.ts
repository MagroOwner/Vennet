"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionError, failure } from "@/lib/action-error";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { identities, listings, stripeAccounts, transactions } from "@/lib/db/schema";
import { countRecentActivity, logActivity } from "@/lib/services/activity";
import { raiseFraudSignal } from "@/lib/services/fraud";
import { getStripe, PLATFORM_FEE_BPS } from "@/lib/stripe";
import { LISTING_CATEGORIES, type ActionResult } from "@/lib/types";

const createListingSchema = z.object({
  title: z.string().trim().min(3, "Title must be 3-120 characters.").max(120),
  description: z
    .string()
    .min(10, "Description must be 10-5000 characters.")
    .max(5000, "Description must be 10-5000 characters."),
  category: z.enum(LISTING_CATEGORIES),
  priceCents: z
    .number()
    .int()
    .min(100, "Price must be between $1 and $100,000.")
    .max(10_000_000, "Price must be between $1 and $100,000."),
  imageUrls: z
    .array(z.string().url().max(2048))
    .max(8, "Up to 8 image URLs allowed.")
    .default([]),
  deliveryFilePaths: z
    .array(z.string().min(1).max(512).startsWith("deliveryFiles/", "Invalid delivery file."))
    .max(8, "Up to 8 delivery files allowed.")
    .default([]),
  deliveryInstructions: z.string().trim().min(10, "Explain how the buyer will access their purchase.").max(5000),
  supportContact: z.string().trim().min(3, "Provide a support email, link, or contact method.").max(500),
});

export async function createListing(
  input: z.input<typeof createListingSchema>
): Promise<ActionResult<{ listingId: string }>> {
  try {
    const { userId } = await requireAuth();
    const data = createListingSchema.parse(input);

    const [identity] = await db
      .select({ userId: identities.userId })
      .from(identities)
      .where(eq(identities.userId, userId))
      .limit(1);
    if (!identity) {
      throw new ActionError("Create a Vennet identity before selling.");
    }

    const [stripeAccount] = await db
      .select({ chargesEnabled: stripeAccounts.chargesEnabled, payoutsEnabled: stripeAccounts.payoutsEnabled })
      .from(stripeAccounts)
      .where(eq(stripeAccounts.userId, userId))
      .limit(1);
    if (!stripeAccount?.chargesEnabled || !stripeAccount.payoutsEnabled) {
      throw new ActionError("Connect and complete Stripe onboarding before creating a listing.");
    }
    if (data.category === "digital" && data.deliveryFilePaths.length === 0) {
      throw new ActionError("Upload at least one downloadable file for a digital product.");
    }
    if (!data.deliveryFilePaths.every((path) => path.startsWith(`deliveryFiles/${userId}/`))) {
      throw new ActionError("Delivery files must be uploaded by the listing seller.");
    }

    // Fraud check: rapid listing creation.
    const recentListings = await countRecentActivity(userId, "listing_created", 10);
    if (recentListings >= 5) {
      await raiseFraudSignal(
        userId,
        "rapid_listing_creation",
        "medium",
        `${recentListings} listings created within 10 minutes`
      );
      throw new ActionError("Too many listings created recently.");
    }

    const [listing] = await db
      .insert(listings)
      .values({
        sellerId: userId,
        title: data.title,
        description: data.description,
        category: data.category,
        priceCents: data.priceCents,
        currency: "usd",
        imageUrls: data.imageUrls,
        deliveryFilePaths: data.deliveryFilePaths,
        deliveryInstructions: data.deliveryInstructions,
        supportContact: data.supportContact,
        status: "active",
      })
      .returning({ id: listings.id });

    await logActivity(userId, "listing_created", { listingId: listing.id });
    revalidatePath("/marketplace");
    revalidatePath("/dashboard/seller");
    return { ok: true, listingId: listing.id };
  } catch (error) {
    return failure(error);
  }
}

const purchaseSchema = z.object({ listingId: z.string().uuid("listingId is required.") });

export async function purchaseListing(
  input: z.input<typeof purchaseSchema>
): Promise<ActionResult<{ transactionId: string; clientSecret: string | null }>> {
  try {
    const { userId } = await requireAuth();
    const { listingId } = purchaseSchema.parse(input);

    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);
    if (!listing) {
      throw new ActionError("Listing not found.");
    }
    if (listing.status !== "active") {
      throw new ActionError("Listing is not available.");
    }
    if (!listing.deliveryInstructions || !listing.supportContact || (listing.category === "digital" && listing.deliveryFilePaths.length === 0)) {
      throw new ActionError("This listing is missing required delivery information and cannot be purchased yet.");
    }
    if (listing.sellerId === userId) {
      await raiseFraudSignal(
        userId,
        "self_purchase_attempt",
        "high",
        `Attempted to purchase own listing ${listingId}`
      );
      throw new ActionError("You cannot purchase your own listing.");
    }

    const recentPurchases = await countRecentActivity(userId, "listing_purchased", 10);
    if (recentPurchases >= 10) {
      await raiseFraudSignal(
        userId,
        "rapid_purchases",
        "medium",
        `${recentPurchases} purchases within 10 minutes`
      );
      throw new ActionError("Too many purchases recently.");
    }

    const [sellerAccount] = await db
      .select()
      .from(stripeAccounts)
      .where(eq(stripeAccounts.userId, listing.sellerId))
      .limit(1);
    if (!sellerAccount?.chargesEnabled) {
      throw new ActionError("Seller has not completed Stripe onboarding.");
    }

    const platformFeeCents = Math.round((listing.priceCents * PLATFORM_FEE_BPS) / 10_000);

    const [transaction] = await db
      .insert(transactions)
      .values({
        listingId,
        buyerId: userId,
        sellerId: listing.sellerId,
        amountCents: listing.priceCents,
        platformFeeCents,
        currency: listing.currency,
        status: "pending",
      })
      .returning({ id: transactions.id });

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: listing.priceCents,
      currency: listing.currency,
      application_fee_amount: platformFeeCents,
      transfer_data: { destination: sellerAccount.stripeAccountId },
      metadata: { transactionId: transaction.id, listingId, buyerId: userId },
    });

    await db
      .update(transactions)
      .set({ stripePaymentIntentId: paymentIntent.id, updatedAt: new Date() })
      .where(eq(transactions.id, transaction.id));

    await logActivity(userId, "listing_purchased", {
      listingId,
      transactionId: transaction.id,
    });

    return {
      ok: true,
      transactionId: transaction.id,
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    return failure(error);
  }
}
