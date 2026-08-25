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
    const [identity] = await db.select({ userId: identities.userId }).from(identities).where(eq(identities.userId, userId)).limit(1);
    if (!identity) throw new ActionError("Create your identity before upgrading to Vennet Pro.");
    const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
    if (!user?.email) throw new ActionError("A verified account email is required for Vennet Pro.");
    const customers = await getStripe().customers.list({ email: user.email, limit: 10 });
    for (const customer of customers.data) {
      const subscriptions = await getStripe().subscriptions.list({ customer: customer.id, status: "all", limit: 100 });
      const hasActivePro = subscriptions.data.some((subscription) =>
        ["active", "trialing", "past_due"].includes(subscription.status) &&
        subscription.items.data.some((item) => item.price.id === priceId)
      );
      if (hasActivePro) throw new ActionError("Your Vennet Pro subscription is already active. Please manage it in Stripe.");
    }
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
