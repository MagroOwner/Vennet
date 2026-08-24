import Stripe from "stripe";

/** Platform fee in basis points (5%). */
export const PLATFORM_FEE_BPS = 500;

let client: Stripe | undefined;

export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set.");
    }
    client = new Stripe(key);
  }
  return client;
}
