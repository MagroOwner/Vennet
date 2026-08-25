"use server";

import { eq } from "drizzle-orm";
import { ActionError, failure } from "@/lib/action-error";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { identities, users } from "@/lib/db/schema";
import { getStripe } from "@/lib/stripe";
import type { ActionResult } from "@/lib/types";

function appUrl(): string {
  const url = process.env.NEXTAUTH_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  if (!url || url.includes("localhost")) throw new ActionError("Vennet Pro checkout is not configured yet.");
  return url.replace(/\/$/, "");
}

export async function startProCheckout(): Promise<ActionResult<{ url: string }>> {
  try {
    const priceId = process.env.STRIPE_PRO_PRICE_ID;
    if (!priceId) throw new ActionError("Vennet Pro checkout is not configured yet. Please contact support.");
    const { userId } = await requireAuth();
    const [identity] = await db.select({ userId: identities.userId, isPro: identities.isPro }).from(identities).where(eq(identities.userId, userId)).limit(1);
    if (!identity) throw new ActionError("Create your identity before upgrading to Vennet Pro.");
    if (identity.isPro) throw new ActionError("Your Vennet Pro membership is already active.");
    const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
    const checkout = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user?.email,
      client_reference_id: userId,
      success_url: `${appUrl()}/pro?success=1`,
      cancel_url: `${appUrl()}/pro?canceled=1`,
      subscription_data: { metadata: { vennetUserId: userId } },
      metadata: { vennetUserId: userId, product: "vennet_pro" },
    });
    if (!checkout.url) throw new ActionError("Stripe could not create a checkout page. Please try again.");
    return { ok: true, url: checkout.url };
  } catch (error) {
    return failure(error);
  }
}
