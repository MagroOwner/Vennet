"use server";

import { and, count, eq, inArray, ne } from "drizzle-orm";
import { ActionError, failure } from "@/lib/action-error";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cartItems, creatorFollows, identities, listings, notificationPreferences, notifications, priceAlerts, sellerCoupons, stripeAccounts, transactions } from "@/lib/db/schema";
import { countRecentActivity, logActivity } from "@/lib/services/activity";
import { raiseFraudSignal } from "@/lib/services/fraud";
import { getStripe, PLATFORM_FEE_BPS } from "@/lib/stripe";
import { LISTING_CATEGORIES, type ActionResult } from "@/lib/types";

function appUrl(): string {
  const url = process.env.NEXTAUTH_URL ?? (process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : undefined);
  if (!url || url.includes("localhost")) throw new ActionError("Checkout is not configured yet. Set NEXTAUTH_URL to Vennet's public URL.");
  return url.replace(/\/$/, "");
}

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
  automationAccessUrl: z.string().trim().url("Use a full automation access URL.").max(2048).or(z.literal("")).default(""),
  supportContact: z.string().trim().min(3, "Provide a support email, link, or contact method.").max(500),
  previewUrl: z.string().trim().url("Use a full preview URL.").max(2048).or(z.literal("")).default(""),
  collection: z.string().trim().max(80).default(""),
  tags: z.array(z.string().trim().min(1).max(32)).max(8).default([]),
  licenseType: z.string().trim().min(3).max(80).default("Personal use"),
  deliveryTime: z.string().trim().min(3).max(120).default("Available after payment"),
  fileType: z.string().trim().max(160).default(""),
  compatibility: z.string().trim().max(300).default(""),
  includesUpdates: z.boolean().default(false),
  updatePolicy: z.string().trim().max(1000).default(""),
  termsAccepted: z.literal(true, { errorMap: () => ({ message: "You must agree to the Terms of Service." }) }),
});

function deliveryDetails(data: z.infer<typeof createListingSchema>) {
  return data.collection === "bots-automations"
    ? data.deliveryInstructions.trim() + "\n\nAutomation access link: " + data.automationAccessUrl.trim()
    : data.deliveryInstructions;
}

export async function createListing(
  input: z.input<typeof createListingSchema>
): Promise<ActionResult<{ listingId: string; published: boolean }>> {
  try {
    const { userId } = await requireAuth();
    const data = createListingSchema.parse(input);

    const [identity] = await db
      .select({ userId: identities.userId, isPro: identities.isPro })
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
    const payoutsReady = Boolean(stripeAccount?.chargesEnabled && stripeAccount.payoutsEnabled);
    if (data.category === "digital" && data.deliveryFilePaths.length === 0 && data.collection !== "bots-automations") {
      throw new ActionError("Upload at least one downloadable file for a digital product.");
    }
    if (data.collection === "bots-automations" && !data.automationAccessUrl) {
      throw new ActionError("Add a working bot or automation access link before publishing.");
    }
    if (!data.deliveryFilePaths.every((path) => path.startsWith(`deliveryFiles/${userId}/`))) {
      throw new ActionError("Delivery files must be uploaded by the listing seller.");
    }

    const listingLimits = identity.isPro
      ? { digital: 10, services: 4, other: 2 }
      : { digital: 2, services: 1, other: 0 };
    const listingLimit = data.category === "digital" || data.category === "services" || data.category === "other"
      ? listingLimits[data.category]
      : 0;
    if (listingLimit === 0) {
      throw new ActionError("Subscriptions are a Vennet Pro seller feature. Upgrade to Pro to list them.");
    }
    const [listingCount] = await db
      .select({ total: count() })
      .from(listings)
      .where(and(eq(listings.sellerId, userId), eq(listings.category, data.category), eq(listings.status, "active")));
    if ((listingCount?.total ?? 0) >= listingLimit) {
      const label = data.category === "other" ? "subscription" : data.category === "services" ? "service" : "digital product";
      throw new ActionError("Your " + label + " listing limit (" + listingLimit + ") has been reached. Upgrade to Vennet Pro for more capacity.");
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
        deliveryInstructions: deliveryDetails(data),
        supportContact: data.supportContact,
        previewUrl: data.previewUrl,
        collection: data.collection,
        tags: data.tags,
        licenseType: data.licenseType,
        deliveryTime: data.deliveryTime,
        fileType: data.fileType,
        compatibility: data.compatibility,
        includesUpdates: data.includesUpdates,
        updatePolicy: data.updatePolicy,
        status: payoutsReady ? "active" : "draft",
      })
      .returning({ id: listings.id });

    const followers = await db.select({ followerId: creatorFollows.followerId }).from(creatorFollows).where(eq(creatorFollows.creatorId, userId));
    const followerPrefs = followers.length ? await db.select().from(notificationPreferences).where(inArray(notificationPreferences.userId, followers.map((follower) => follower.followerId))) : [];
    const releaseRecipients = followers.filter((follower) => followerPrefs.find((pref) => pref.userId === follower.followerId)?.creatorReleases !== false);
    if (releaseRecipients.length) await db.insert(notifications).values(releaseRecipients.map((follower) => ({ userId: follower.followerId, title: "New creator release", body: data.title + " is now available.", href: "/marketplace/" + listing.id })));
    await logActivity(userId, "listing_created", { listingId: listing.id });
    revalidatePath("/marketplace");
    revalidatePath("/dashboard/seller");
    return { ok: true, listingId: listing.id, published: payoutsReady };
  } catch (error) {
    return failure(error);
  }
}


const updateListingSchema = createListingSchema.extend({
  listingId: z.string().uuid("Listing not found."),
});

export async function updateListing(
  input: z.input<typeof updateListingSchema>
): Promise<ActionResult<{ listingId: string; published: boolean }>> {
  try {
    const { userId } = await requireAuth();
    const data = updateListingSchema.parse(input);
    const [listing] = await db
      .select()
      .from(listings)
      .where(and(eq(listings.id, data.listingId), eq(listings.sellerId, userId)))
      .limit(1);
    if (!listing) throw new ActionError("You can only edit your own listings.");

    const [identity] = await db
      .select({ isPro: identities.isPro })
      .from(identities)
      .where(eq(identities.userId, userId))
      .limit(1);
    if (!identity) throw new ActionError("Create a Vennet identity before editing listings.");
    if (data.category === "digital" && data.deliveryFilePaths.length === 0 && data.collection !== "bots-automations") {
      throw new ActionError("Upload at least one downloadable file for a digital product.");
    }
    if (data.collection === "bots-automations" && !data.automationAccessUrl) {
      throw new ActionError("Add a working bot or automation access link before saving.");
    }
    if (!data.deliveryFilePaths.every((path) => path.startsWith(`deliveryFiles/${userId}/`))) {
      throw new ActionError("Delivery files must be uploaded by the listing seller.");
    }

    const listingLimits = identity.isPro
      ? { digital: 10, services: 4, other: 2 }
      : { digital: 2, services: 1, other: 0 };
    const listingLimit = data.category === "digital" || data.category === "services" || data.category === "other"
      ? listingLimits[data.category]
      : 0;
    if (listingLimit === 0 && data.category !== listing.category) {
      throw new ActionError("Subscriptions are a Vennet Pro seller feature. Upgrade to Pro to list them.");
    }
    if (data.category !== listing.category) {
      const [listingCount] = await db
        .select({ total: count() })
        .from(listings)
        .where(and(
          eq(listings.sellerId, userId),
          eq(listings.category, data.category),
          eq(listings.status, "active"),
          ne(listings.id, listing.id)
        ));
      if ((listingCount?.total ?? 0) >= listingLimit) {
        const label = data.category === "other" ? "subscription" : data.category === "services" ? "service" : "digital product";
        throw new ActionError("Your " + label + " listing limit (" + listingLimit + ") has been reached.");
      }
    }

    await db
      .update(listings)
      .set({
        title: data.title,
        description: data.description,
        category: data.category,
        priceCents: data.priceCents,
        imageUrls: data.imageUrls,
        deliveryFilePaths: data.deliveryFilePaths,
        deliveryInstructions: deliveryDetails(data),
        supportContact: data.supportContact,
        previewUrl: data.previewUrl,
        collection: data.collection,
        tags: data.tags,
        licenseType: data.licenseType,
        deliveryTime: data.deliveryTime,
        fileType: data.fileType,
        compatibility: data.compatibility,
        includesUpdates: data.includesUpdates,
        updatePolicy: data.updatePolicy,
        updatedAt: new Date(),
      })
      .where(eq(listings.id, listing.id));

    if (data.priceCents < listing.priceCents) {
      const alertSubscribers = await db.select({ userId: priceAlerts.userId }).from(priceAlerts).where(eq(priceAlerts.listingId, listing.id));
      const alertPrefs = alertSubscribers.length ? await db.select().from(notificationPreferences).where(inArray(notificationPreferences.userId, alertSubscribers.map((subscriber) => subscriber.userId))) : [];
      const priceRecipients = alertSubscribers.filter((subscriber) => alertPrefs.find((pref) => pref.userId === subscriber.userId)?.priceDrops !== false);
      if (priceRecipients.length) await db.insert(notifications).values(priceRecipients.map((subscriber) => ({ userId: subscriber.userId, title: "A saved offer dropped in price", body: listing.title + " is now available for less.", href: "/marketplace/" + listing.id })));
    }
    if (data.deliveryInstructions !== listing.deliveryInstructions || data.deliveryFilePaths.join("|") !== listing.deliveryFilePaths.join("|")) {
      const buyers = await db.select({ buyerId: transactions.buyerId }).from(transactions).where(and(eq(transactions.listingId, listing.id), eq(transactions.status, "paid")));
      if (buyers.length) await db.insert(notifications).values(buyers.map((buyer) => ({ userId: buyer.buyerId, title: "Your purchase has an access update", body: listing.title + " has updated delivery or access details.", href: "/inventory" })));
    }
    revalidatePath("/marketplace");
    revalidatePath("/marketplace/" + listing.id);
    revalidatePath("/marketplace/" + listing.id + "/edit");
    revalidatePath("/dashboard/seller");
    return { ok: true, listingId: listing.id, published: listing.status === "active" };
  } catch (error) {
    return failure(error);
  }
}

const purchaseSchema = z.object({
  listingId: z.string().uuid("listingId is required."),
  couponCode: z.string().trim().toUpperCase().max(32).optional(),
  termsAccepted: z.literal(true, { errorMap: () => ({ message: "You must agree to the Terms of Service before purchase." }) }),
});

const purchaseCartSchema = z.object({
  termsAccepted: z.literal(true, { errorMap: () => ({ message: "You must agree to the Terms of Service before purchase." }) }),
});

export async function purchaseListing(
  input: z.input<typeof purchaseSchema>
): Promise<ActionResult<{ transactionId: string; url: string }>> {
  try {
    const { userId } = await requireAuth();
    const { listingId, couponCode } = purchaseSchema.parse(input);

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
    if (!listing.deliveryInstructions || !listing.supportContact || (listing.category === "digital" && listing.deliveryFilePaths.length === 0 && listing.collection !== "bots-automations")) {
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

    let amountCents = listing.priceCents;
    if (couponCode) {
      const [coupon] = await db.select().from(sellerCoupons).where(and(eq(sellerCoupons.sellerId, listing.sellerId), eq(sellerCoupons.code, couponCode), eq(sellerCoupons.active, true))).limit(1);
      if (!coupon || (coupon.expiresAt && coupon.expiresAt <= new Date())) throw new ActionError("That launch offer is not available.");
      amountCents = Math.max(1, Math.round(listing.priceCents * (100 - coupon.discountPercent) / 100));
    }
    const platformFeeCents = Math.round((amountCents * PLATFORM_FEE_BPS) / 10_000);

    const [transaction] = await db
      .insert(transactions)
      .values({
        listingId,
        buyerId: userId,
        sellerId: listing.sellerId,
        amountCents,
        platformFeeCents,
        currency: listing.currency,
        status: "pending",
      })
      .returning({ id: transactions.id });

    const checkout = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{
        quantity: 1,
        price_data: {
          currency: listing.currency,
          unit_amount: amountCents,
          product_data: { name: listing.title, description: listing.description.slice(0, 500) },
        },
      }],
      payment_intent_data: {
        application_fee_amount: platformFeeCents,
        transfer_data: { destination: sellerAccount.stripeAccountId },
        metadata: { transactionId: transaction.id, listingId, buyerId: userId },
      },
      client_reference_id: userId,
      metadata: { transactionId: transaction.id, listingId, buyerId: userId },
      success_url: appUrl() + "/inventory?purchase=success",
      cancel_url: appUrl() + "/marketplace/" + listingId + "?purchase=cancelled",
    });
    if (!checkout.url) throw new ActionError("Stripe could not start checkout. Please try again.");

    await logActivity(userId, "listing_purchased", { listingId, transactionId: transaction.id });
    return { ok: true, transactionId: transaction.id, url: checkout.url };
  } catch (error) {
    return failure(error);
  }
}

export async function purchaseCart(
  input: z.input<typeof purchaseCartSchema>
): Promise<ActionResult<{ url: string }>> {
  try {
    const { userId } = await requireAuth();
    purchaseCartSchema.parse(input);
    const rows = await db.select({ listing: listings }).from(cartItems).innerJoin(listings, eq(cartItems.listingId, listings.id)).where(eq(cartItems.userId, userId));
    const cartListings = rows.map((row) => row.listing);
    if (!cartListings.length) throw new ActionError("Your cart is empty.");
    if (cartListings.some((listing) => listing.status !== "active")) throw new ActionError("Remove unavailable offers before checkout.");
    const sellerId = cartListings[0].sellerId;
    if (cartListings.some((listing) => listing.sellerId !== sellerId)) throw new ActionError("For protected Stripe payouts, check out items from one creator at a time.");
    const [sellerAccount] = await db.select().from(stripeAccounts).where(eq(stripeAccounts.userId, sellerId)).limit(1);
    if (!sellerAccount?.chargesEnabled) throw new ActionError("This creator cannot accept payments yet.");
    const transactionRows = await db.transaction(async (tx) => Promise.all(cartListings.map(async (listing) => {
      const fee = Math.round((listing.priceCents * PLATFORM_FEE_BPS) / 10_000);
      const [transaction] = await tx.insert(transactions).values({ listingId: listing.id, buyerId: userId, sellerId, amountCents: listing.priceCents, platformFeeCents: fee, currency: listing.currency, status: "pending" }).returning({ id: transactions.id });
      return { transaction, fee };
    })));
    const checkout = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: cartListings.map((listing) => ({ quantity: 1, price_data: { currency: listing.currency, unit_amount: listing.priceCents, product_data: { name: listing.title, description: listing.description.slice(0, 500) } } })),
      payment_intent_data: { application_fee_amount: transactionRows.reduce((total, row) => total + row.fee, 0), transfer_data: { destination: sellerAccount.stripeAccountId }, metadata: { transactionIds: transactionRows.map((row) => row.transaction.id).join(","), listingIds: cartListings.map((listing) => listing.id).join(","), buyerId: userId } },
      client_reference_id: userId,
      metadata: { transactionIds: transactionRows.map((row) => row.transaction.id).join(","), listingIds: cartListings.map((listing) => listing.id).join(","), buyerId: userId },
      success_url: appUrl() + "/inventory?purchase=success",
      cancel_url: appUrl() + "/cart?checkout=cancelled",
    });
    if (!checkout.url) throw new ActionError("Stripe could not start cart checkout.");
    return { ok: true, url: checkout.url };
  } catch (error) { return failure(error); }
}


const listingVisibilitySchema = z.object({
  listingId: z.string().uuid("Listing not found."),
  visible: z.boolean(),
});

export async function setListingVisibility(
  input: z.input<typeof listingVisibilitySchema>
): Promise<ActionResult<{ listingId: string; visible: boolean }>> {
  try {
    const { userId } = await requireAuth();
    const { listingId, visible } = listingVisibilitySchema.parse(input);
    const [listing] = await db
      .select({ id: listings.id, sellerId: listings.sellerId, status: listings.status })
      .from(listings)
      .where(and(eq(listings.id, listingId), eq(listings.sellerId, userId)))
      .limit(1);

    if (!listing) throw new ActionError("You can only manage your own listings.");
    if (listing.status === "suspended") throw new ActionError("This listing is suspended and cannot be changed here.");
    if (visible) {
      const [stripeAccount] = await db
        .select({ chargesEnabled: stripeAccounts.chargesEnabled, payoutsEnabled: stripeAccounts.payoutsEnabled })
        .from(stripeAccounts)
        .where(eq(stripeAccounts.userId, userId))
        .limit(1);
      if (!stripeAccount?.chargesEnabled || !stripeAccount.payoutsEnabled) {
        throw new ActionError("Set up Stripe payouts before publishing this listing. Your draft will stay private until then.");
      }
    }

    await db
      .update(listings)
      .set({ status: visible ? "active" : "draft", updatedAt: new Date() })
      .where(eq(listings.id, listing.id));

    revalidatePath("/marketplace");
    revalidatePath("/marketplace/" + listing.id);
    revalidatePath("/dashboard/seller");
    return { ok: true, listingId: listing.id, visible };
  } catch (error) {
    return failure(error);
  }
}
