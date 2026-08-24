import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { stripeAccounts, transactions } from "@/lib/db/schema";
import { completeTransaction } from "@/lib/services/transactions";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function markTransactionStatus(
  paymentIntentId: string,
  status: "failed" | "refunded"
): Promise<void> {
  await db
    .update(transactions)
    .set({ status, updatedAt: new Date() })
    .where(eq(transactions.stripePaymentIntentId, paymentIntentId));
}

export async function POST(request: Request): Promise<NextResponse> {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ error: "Missing webhook signature." }, { status: 400 });
  }

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
        const transactionId = intent.metadata?.transactionId;
        if (transactionId) {
          await completeTransaction(transactionId);
        }
        break;
      }
      case "payment_intent.payment_failed": {
        await markTransactionStatus(event.data.object.id, "failed");
        break;
      }
      case "charge.refunded": {
        const paymentIntent = event.data.object.payment_intent;
        if (typeof paymentIntent === "string") {
          await markTransactionStatus(paymentIntent, "refunded");
        }
        break;
      }
      case "account.updated": {
        const account = event.data.object;
        await db
          .update(stripeAccounts)
          .set({
            chargesEnabled: account.charges_enabled ?? false,
            payoutsEnabled: account.payouts_enabled ?? false,
            onboardingComplete: account.details_submitted ?? false,
            updatedAt: new Date(),
          })
          .where(eq(stripeAccounts.stripeAccountId, account.id));
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
