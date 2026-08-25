"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ActionError, failure } from "@/lib/action-error";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { identities } from "@/lib/db/schema";
import { logActivity } from "@/lib/services/activity";
import { getStripe } from "@/lib/stripe";
import type { ActionResult } from "@/lib/types";

function appUrl(): string {
  const url = process.env.NEXTAUTH_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  if (!url || url.includes("localhost")) {
    throw new ActionError("Identity verification is not configured yet. Set NEXTAUTH_URL to Vennet's public URL.");
  }
  return url.replace(/\/$/, "");
}

export async function startStripeIdentityVerification(): Promise<ActionResult<{ url: string }>> {
  try {
    const flowId = process.env.STRIPE_IDENTITY_FLOW_ID;
    if (!flowId) {
      throw new ActionError("Identity verification is not configured yet. Add STRIPE_IDENTITY_FLOW_ID in Vercel Production settings.");
    }

    const { userId } = await requireAuth();
    const [identity] = await db.select({ userId: identities.userId }).from(identities).where(eq(identities.userId, userId)).limit(1);
    if (!identity) throw new ActionError("Create a Vennet identity before starting verification.");

    const session = await getStripe().identity.verificationSessions.create({
      verification_flow: flowId,
      return_url: `${appUrl()}/verification?stripe_return=1`,
      client_reference_id: userId,
      metadata: { vennetUserId: userId },
    });
    if (!session.url) throw new ActionError("Stripe could not start verification. Please try again.");

    await db.update(identities).set({ verificationStatus: "pending", updatedAt: new Date() }).where(eq(identities.userId, userId));
    await logActivity(userId, "verification_submitted", { provider: "stripe", verificationSessionId: session.id });
    revalidatePath("/verification");
    return { ok: true, url: session.url };
  } catch (error) {
    console.error("Stripe Identity verification error", error);
    return failure(error);
  }
}
