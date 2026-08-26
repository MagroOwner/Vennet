"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { failure } from "@/lib/action-error";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notificationPreferences } from "@/lib/db/schema";
import type { ActionResult } from "@/lib/types";

const schema = z.object({ priceDrops: z.boolean(), creatorReleases: z.boolean(), purchaseUpdates: z.boolean(), productUpdates: z.boolean() });

export async function updateNotificationPreferences(input: z.input<typeof schema>): Promise<ActionResult> {
  try {
    const { userId } = await requireAuth();
    const data = schema.parse(input);
    await db.insert(notificationPreferences).values({ userId, ...data, updatedAt: new Date() }).onConflictDoUpdate({ target: notificationPreferences.userId, set: { ...data, updatedAt: new Date() } });
    revalidatePath("/settings");
    return { ok: true };
  } catch (error) { return failure(error); }
}
