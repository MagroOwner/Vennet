import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import Stripe from "stripe";
import { collections, Timestamp } from "../lib/firestore";
import { requireAuth } from "../lib/auth";
import { logActivity } from "../lib/activity";
import { getStripe, stripeSecretKey, stripeWebhookSecret } from "../lib/stripe";
import { completeTransaction } from "./marketplace";

interface StripeOnboardData {
  returnUrl: string;
  refreshUrl: string;
}

export const stripeOnboard = onCall<StripeOnboardData>(
  { secrets: [stripeSecretKey] },
  async (request) => {
    const uid = requireAuth(request);
    const { returnUrl, refreshUrl } = request.data ?? {};

    if (typeof returnUrl !== "string" || !returnUrl.startsWith("https://")) {
      throw new HttpsError("invalid-argument", "A valid https returnUrl is required.");
    }
    if (typeof refreshUrl !== "string" || !refreshUrl.startsWith("https://")) {
      throw new HttpsError("invalid-argument", "A valid https refreshUrl is required.");
    }

    const stripe = getStripe();
    const ref = collections.stripeAccounts().doc(uid);
    const existing = await ref.get();

    let accountId: string;
    if (existing.exists) {
      accountId = existing.data()!.stripeAccountId;
    } else {
      const account = await stripe.accounts.create({
        type: "standard",
        metadata: { uid },
      });
      accountId = account.id;
      const now = Timestamp.now();
      await ref.set({
        uid,
        stripeAccountId: accountId,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      return_url: returnUrl,
      refresh_url: refreshUrl,
      type: "account_onboarding",
    });

    await logActivity(uid, "stripe_onboarded", { accountId });
    return { ok: true, url: link.url };
  }
);

export const stripeWebhook = onRequest(
  { secrets: [stripeSecretKey, stripeWebhookSecret] },
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      res.status(400).send("Missing signature");
      return;
    }

    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(
        req.rawBody,
        signature,
        stripeWebhookSecret.value()
      );
    } catch (err) {
      logger.error("Webhook signature verification failed", err);
      res.status(400).send("Invalid signature");
      return;
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
          const intent = event.data.object;
          const transactionId = intent.metadata?.transactionId;
          if (transactionId) {
            await collections.transactions().doc(transactionId).update({
              status: "failed",
              updatedAt: Timestamp.now(),
            });
          }
          break;
        }
        case "account.updated": {
          const account = event.data.object;
          const uid = account.metadata?.uid;
          if (uid) {
            await collections.stripeAccounts().doc(uid).set(
              {
                chargesEnabled: account.charges_enabled ?? false,
                payoutsEnabled: account.payouts_enabled ?? false,
                onboardingComplete: account.details_submitted ?? false,
                updatedAt: Timestamp.now(),
              },
              { merge: true }
            );
          }
          break;
        }
        case "charge.refunded": {
          const charge = event.data.object;
          const transactionId = charge.metadata?.transactionId;
          if (transactionId) {
            await collections.transactions().doc(transactionId).update({
              status: "refunded",
              updatedAt: Timestamp.now(),
            });
          }
          break;
        }
        default:
          logger.debug(`Unhandled event type ${event.type}`);
      }
      res.status(200).send({ received: true });
    } catch (err) {
      logger.error(`Error handling webhook event ${event.type}`, err);
      res.status(500).send("Webhook handler error");
    }
  }
);
