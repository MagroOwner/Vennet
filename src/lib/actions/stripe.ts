"use server";

import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { ActionError, failure } from "@/lib/action-error";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripeAccounts, users } from "@/lib/db/schema";
import { logActivity } from "@/lib/services/activity";
import { getStripe } from "@/lib/stripe";
import type { ActionResult } from "@/lib/types";

function appUrl(): string {
  const url = process.env.NEXTAUTH_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  if (!url || url.includes("localhost")) throw new ActionError("Seller payouts are not configured yet. Set NEXTAUTH_URL to your public Vennet URL.");
  return url.replace(/\/$/, "");
}

function onboardingError(error: unknown, step: "account" | "onboarding link"): ActionError {
  console.error(`Stripe ${step} error`, error);
  if (error instanceof Stripe.errors.StripeAuthenticationError) return new ActionError("Stripe could not authenticate. Check the STRIPE_SECRET_KEY in Vercel and redeploy.");
  if (error instanceof Stripe.errors.StripePermissionError) return new ActionError("This Stripe key does not have permission to create connected accounts. Enable Stripe Connect for your platform.");
  if (error instanceof Stripe.errors.StripeError) return new ActionError(`Stripe rejected the ${step}: ${error.message}`);
  return new ActionError("Stripe onboarding is temporarily unavailable. Please try again or contact support.");
}

async function createAccount(stripe: Stripe, email?: string | null): Promise<string> {
  const account = await stripe.accounts.create({ type: "standard", email: email ?? undefined });
  return account.id;
}

export async function stripeOnboard(): Promise<ActionResult<{ url: string }>> {
  try {
    if (!process.env.STRIPE_SECRET_KEY) throw new ActionError("Seller payouts are not configured yet. Add STRIPE_SECRET_KEY in Vercel Production settings.");
    const { userId } = await requireAuth();
    const stripe = getStripe();
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const [existing] = await db.select().from(stripeAccounts).where(eq(stripeAccounts.userId, userId)).limit(1);

    let accountId: string | undefined = existing?.stripeAccountId;
    if (accountId) {
      try { await stripe.accounts.retrieve(accountId); }
      catch (error) {
        if (error instanceof Stripe.errors.StripeInvalidRequestError) accountId = undefined;
        else throw onboardingError(error, "account");
      }
    }

    if (!accountId) {
      try { accountId = await createAccount(stripe, user?.email); }
      catch (error) { throw onboardingError(error, "account"); }
      await db.insert(stripeAccounts).values({ userId, stripeAccountId: accountId }).onConflictDoUpdate({
        target: stripeAccounts.userId,
        set: { stripeAccountId: accountId, onboardingComplete: false, chargesEnabled: false, payoutsEnabled: false, updatedAt: new Date() },
      });
    }

    let link: Stripe.AccountLink;
    try {
      link = await stripe.accountLinks.create({ account: accountId, refresh_url: `${appUrl()}/stripe/onboarding?refresh=1`, return_url: `${appUrl()}/dashboard/seller`, type: "account_onboarding" });
    } catch (error) { throw onboardingError(error, "onboarding link"); }

    await logActivity(userId, "stripe_onboarded", { accountId });
    return { ok: true, url: link.url };
  } catch (error) {
    return failure(error);
  }
}

const intentSchema = z.object({ paymentIntentId: z.string().min(1) });

export async function refreshPaymentIntentStatus(input: z.input<typeof intentSchema>): Promise<ActionResult<{ status: string }>> {
  try {
    await requireAuth();
    const { paymentIntentId } = intentSchema.parse(input);
    const intent = await getStripe().paymentIntents.retrieve(paymentIntentId);
    return { ok: true, status: intent.status };
  } catch (error) {
    return failure(error);
  }
}
