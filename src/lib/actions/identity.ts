"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionError, failure } from "@/lib/action-error";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { identities, reputationScores, users } from "@/lib/db/schema";
import { logActivity } from "@/lib/services/activity";
import { BASE_SCORE } from "@/lib/services/reputation";
import type { ActionResult } from "@/lib/types";

const nameSchema = z.string().trim().min(2, "Name must be 2-60 characters.").max(60);
const bioSchema = z.string().max(500, "Bio must be at most 500 characters.");
const avatarSchema = z.string().url("Invalid avatar URL.").max(2048);

const createIdentitySchema = z.object({
  name: nameSchema,
  bio: bioSchema.default(""),
  avatarUrl: avatarSchema.optional(),
});

export async function createIdentity(
  input: z.input<typeof createIdentitySchema>
): Promise<ActionResult> {
  try {
    const { userId } = await requireAuth();
    const data = createIdentitySchema.parse(input);

    const [existing] = await db
      .select({ userId: identities.userId })
      .from(identities)
      .where(eq(identities.userId, userId))
      .limit(1);
    if (existing) {
      throw new ActionError("Identity already exists.");
    }

    await db.transaction(async (tx) => {
      await tx.insert(identities).values({
        userId,
        name: data.name,
        bio: data.bio,
        avatarUrl: data.avatarUrl ?? null,
        verificationStatus: "unverified",
        reputationScore: BASE_SCORE,
        isPro: false,
      });
      await tx
        .insert(reputationScores)
        .values({ userId, score: BASE_SCORE, level: "new", totalEvents: 0 })
        .onConflictDoNothing();
    });

    await logActivity(userId, "identity_created", { name: data.name });
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

const updateIdentitySchema = z.object({
  name: nameSchema.optional(),
  bio: bioSchema.optional(),
  avatarUrl: avatarSchema.optional(),
});

export async function updateIdentity(
  input: z.input<typeof updateIdentitySchema>
): Promise<ActionResult> {
  try {
    const { userId } = await requireAuth();
    const data = updateIdentitySchema.parse(input);

    const [existing] = await db
      .select({ userId: identities.userId })
      .from(identities)
      .where(eq(identities.userId, userId))
      .limit(1);
    if (!existing) {
      throw new ActionError("Identity does not exist. Create it first.");
    }

    await db
      .update(identities)
      .set({
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
        updatedAt: new Date(),
      })
      .where(eq(identities.userId, userId));

    await logActivity(userId, "identity_updated", {});
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function upgradeToPro(): Promise<ActionResult> {
  try {
    const { userId } = await requireAuth();
    const [existing] = await db
      .select({ userId: identities.userId })
      .from(identities)
      .where(eq(identities.userId, userId))
      .limit(1);
    if (!existing) {
      throw new ActionError("Identity does not exist.");
    }

    // In production this is gated on a Stripe subscription; the webhook flips
    // isPro on invoice.paid events.
    await db.transaction(async (tx) => {
      await tx
        .update(identities)
        .set({ isPro: true, updatedAt: new Date() })
        .where(eq(identities.userId, userId));
      await tx
        .update(users)
        .set({ isPro: true, updatedAt: new Date() })
        .where(eq(users.id, userId));
    });

    revalidatePath("/pro");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}
