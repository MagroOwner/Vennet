"use server";

import { z } from "zod";
import { failure } from "@/lib/action-error";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { welcomeResponses } from "@/lib/db/welcome-schema";
import type { ActionResult } from "@/lib/types";

const welcomeSchema = z.object({
  reason: z.enum(["buy", "sell", "both", "explore"]),
  discoverySource: z.enum(["tiktok", "instagram", "discord", "friend", "search", "other"]),
  goal: z.enum(["launch", "discover", "grow", "learn"]),
});

export async function saveWelcomeResponse(
  input: z.input<typeof welcomeSchema>
): Promise<ActionResult> {
  try {
    const { userId } = await requireAuth();
    const data = welcomeSchema.parse(input);

    await db
      .insert(welcomeResponses)
      .values({ userId, ...data })
      .onConflictDoNothing();

    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}
