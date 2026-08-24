"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { failure } from "@/lib/action-error";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripeAccounts, users } from "@/lib/db/schema";
import { logActivity } from "@/lib/services/activity";
import { getStripe } from "@/lib/stripe";
import type { ActionResult } from "@/lib/types";

function appUrl(): string {
  return (
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

/** Creates (or reuses) a Connect Standard account and returns an onboarding link. */
export async function stripeOnboard(): Promise<ActionResult<{ url: string }>> {
  try {
    const { userId } = await requireAuth();
    const stripe = getStripe();

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const [existing] = await db
      .select()
      .from(stripeAccounts)
      .where(eq(stripeAccounts.userId, userId))
      .limit(1);

    let accountId = existing?.stripeAccountId;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "standard",
        email: user?.email,
        metadata: { userId },
      });
      accountId = account.id;
      await db
        .insert(stripeAccounts)
        .values({ userId, stripeAccountId: accountId })
        .onConflictDoUpdate({
          target: stripeAccounts.userId,
          set: { stripeAccountId: accountId, updatedAt: new Date() },
        });
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl()}/stripe/onboarding?refresh=1`,
      return_url: `${appUrl()}/dashboard/seller`,
      type: "account_onboarding",
    });

    await logActivity(userId, "stripe_onboarded", { accountId });
    return { ok: true, url: link.url };
  } catch (error) {
    return failure(error);
  }
}

const intentSchema = z.object({
  paymentIntentId: z.string().min(1),
});

/** Confirms a PaymentIntent status for the buyer after checkout. */
export async function refreshPaymentIntentStatus(
  input: z.input<typeof intentSchema>
): Promise<ActionResult<{ status: string }>> {
  try {
    await requireAuth();
    const { paymentIntentId } = intentSchema.parse(input);
    const intent = await getStripe().paymentIntents.retrieve(paymentIntentId);
    return { ok: true, status: intent.status };
  } catch (error) {
    return failure(error);
  }
}
