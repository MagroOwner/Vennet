"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionError, failure } from "@/lib/action-error";
import { requireAuth, requireModerator } from "@/lib/auth";
import { db } from "@/lib/db";
import { identities, verificationRequests } from "@/lib/db/schema";
import { logActivity } from "@/lib/services/activity";
import { applyReputationEvent } from "@/lib/services/reputation";
import { DOCUMENT_TYPES, type ActionResult } from "@/lib/types";

const submitSchema = z.object({
  fullName: z.string().trim().min(2, "Full legal name is required.").max(120),
  documentType: z.enum(DOCUMENT_TYPES),
  documentPaths: z
    .array(
      z
        .string()
        .max(512)
        .startsWith("verificationDocs/", "Invalid document path.")
    )
    .min(1, "Upload at least one document.")
    .max(4, "Up to 4 documents allowed."),
});

export async function submitVerification(
  input: z.input<typeof submitSchema>
): Promise<ActionResult<{ requestId: string }>> {
  try {
    const { userId } = await requireAuth();
    const data = submitSchema.parse(input);
    if (!data.documentPaths.every((p) => p.startsWith(`verificationDocs/${userId}/`))) {
      throw new ActionError("Documents must be uploaded by the requesting user.");
    }

    const [identity] = await db
      .select({ userId: identities.userId })
      .from(identities)
      .where(eq(identities.userId, userId))
      .limit(1);
    if (!identity) {
      throw new ActionError("Create a Vennet identity before requesting verification.");
    }

    const [pending] = await db
      .select({ id: verificationRequests.id })
      .from(verificationRequests)
      .where(
        and(
          eq(verificationRequests.userId, userId),
          eq(verificationRequests.status, "pending")
        )
      )
      .limit(1);
    if (pending) {
      throw new ActionError("You already have a pending verification request.");
    }

    const request = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(verificationRequests)
        .values({
          userId,
          fullName: data.fullName,
          documentType: data.documentType,
          documentPaths: data.documentPaths,
          status: "pending",
        })
        .returning({ id: verificationRequests.id });

      await tx
        .update(identities)
        .set({ verificationStatus: "pending", updatedAt: new Date() })
        .where(eq(identities.userId, userId));

      return created;
    });

    await logActivity(userId, "verification_submitted", { requestId: request.id });
    revalidatePath("/verification");
    return { ok: true, requestId: request.id };
  } catch (error) {
    return failure(error);
  }
}

const reviewSchema = z.object({
  requestId: z.string().uuid("requestId is required."),
  approve: z.boolean(),
  note: z.string().max(1000).optional(),
});

export async function approveVerification(
  input: z.input<typeof reviewSchema>
): Promise<ActionResult> {
  try {
    const { userId: reviewerId } = await requireModerator();
    const data = reviewSchema.parse(input);

    const [request] = await db
      .select()
      .from(verificationRequests)
      .where(eq(verificationRequests.id, data.requestId))
      .limit(1);
    if (!request) {
      throw new ActionError("Verification request not found.");
    }
    if (request.status !== "pending") {
      throw new ActionError("Verification request already reviewed.");
    }

    await db.transaction(async (tx) => {
      await tx
        .update(verificationRequests)
        .set({
          status: data.approve ? "approved" : "rejected",
          reviewedBy: reviewerId,
          reviewNote: data.note ?? null,
          updatedAt: new Date(),
        })
        .where(eq(verificationRequests.id, data.requestId));

      await tx
        .update(identities)
        .set({
          verificationStatus: data.approve ? "verified" : "rejected",
          updatedAt: new Date(),
        })
        .where(eq(identities.userId, request.userId));
    });

    if (data.approve) {
      await applyReputationEvent({
        userId: request.userId,
        type: "verification_approved",
        reason: "Identity verification approved",
        actorId: reviewerId,
        relatedId: data.requestId,
      });
    }

    revalidatePath("/admin");
    revalidatePath("/verification");
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}
