import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { cartItems, identities, stripeAccounts, transactions, users } from "@/lib/db/schema";
import { completeTransaction } from "@/lib/services/transactions";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function markTransactionStatus(paymentIntentId: string, status: "failed" | "refunded"): Promise<void> {
  await db.update(transactions).set({ status, updatedAt: new Date() }).where(eq(transactions.stripePaymentIntentId, paymentIntentId));
}

async function setPro(userId: string, isPro: boolean): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.update(users).set({ isPro, updatedAt: new Date() }).where(eq(users.id, userId));
    await tx.update(identities).set({ isPro, updatedAt: new Date() }).where(eq(identities.userId, userId));
  });
}

async function setIdentityVerification(userId: string, verificationStatus: "verified" | "rejected"): Promise<void> {
  await db.update(identities).set({ verificationStatus, updatedAt: new Date() }).where(eq(identities.userId, userId));
}

async function userIdForSubscription(subscriptionId: string): Promise<string | undefined> {
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  return subscription.metadata.vennetUserId || undefined;
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | undefined {
  const value = invoice as unknown as { subscription?: string; parent?: { subscription_details?: { subscription?: string } } };
  return value.subscription ?? value.parent?.subscription_details?.subscription;
}

function verificationUserId(session: Stripe.Identity.VerificationSession): string | undefined {
  return session.client_reference_id ?? session.metadata.vennetUserId ?? undefined;
}

export async function POST(request: Request): Promise<NextResponse> {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: "Missing webhook signature." }, { status: 400 });

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("Stripe signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object;
        const transactionIds = (intent.metadata?.transactionIds ?? intent.metadata?.transactionId ?? "").split(",").filter(Boolean);
        for (const transactionId of transactionIds) await completeTransaction(transactionId);
        const buyerId = intent.metadata?.buyerId;
        const listingIds = intent.metadata?.listingIds?.split(",").filter(Boolean) ?? [];
        if (buyerId && listingIds.length) await db.delete(cartItems).where(and(eq(cartItems.userId, buyerId), inArray(cartItems.listingId, listingIds)));
        break;
      }
      case "payment_intent.payment_failed":
        await markTransactionStatus(event.data.object.id, "failed");
        break;
      case "charge.refunded": {
        const paymentIntent = event.data.object.payment_intent;
        if (typeof paymentIntent === "string") await markTransactionStatus(paymentIntent, "refunded");
        break;
      }
      case "account.updated": {
        const account = event.data.object;
        await db.update(stripeAccounts).set({
          chargesEnabled: account.charges_enabled ?? false,
          payoutsEnabled: account.payouts_enabled ?? false,
          onboardingComplete: account.details_submitted ?? false,
          updatedAt: new Date(),
        }).where(eq(stripeAccounts.stripeAccountId, account.id));
        break;
      }
      case "identity.verification_session.verified": {
        const userId = verificationUserId(event.data.object);
        if (userId) await setIdentityVerification(userId, "verified");
        break;
      }
      case "identity.verification_session.requires_input": {
        const userId = verificationUserId(event.data.object);
        if (userId) await setIdentityVerification(userId, "rejected");
        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id ?? session.metadata?.vennetUserId;
        if (userId && session.mode === "subscription" && session.payment_status === "paid") await setPro(userId, true);
        break;
      }
      case "invoice.paid": {
        const subscriptionId = invoiceSubscriptionId(event.data.object);
        if (subscriptionId) {
          const userId = await userIdForSubscription(subscriptionId);
          if (userId) await setPro(userId, true);
        }
        break;
      }
      case "invoice.payment_failed": {
        const subscriptionId = invoiceSubscriptionId(event.data.object);
        if (subscriptionId) {
          const userId = await userIdForSubscription(subscriptionId);
          if (userId) await setPro(userId, false);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = subscription.metadata.vennetUserId;
        if (userId) await setPro(userId, false);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error(`Failed to handle Stripe event ${event.type}`, error);
    return NextResponse.json({ error: "Handler error." }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
