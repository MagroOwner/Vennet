"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { ActionError, failure } from "@/lib/action-error";
import { db } from "@/lib/db";
import { roles, users } from "@/lib/db/schema";
import type { ActionResult } from "@/lib/types";

const signUpSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(200),
  displayName: z.string().trim().max(80).default(""),
});

export async function registerUser(
  input: z.input<typeof signUpSchema>
): Promise<ActionResult> {
  try {
    const data = signUpSchema.parse(input);

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);
    if (existing) {
      throw new ActionError("An account with that email already exists.");
    }

    const passwordHash = await hash(data.password, 12);
    await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(users)
        .values({
          email: data.email,
          passwordHash,
          displayName: data.displayName,
        })
        .returning({ id: users.id });
      await tx.insert(roles).values({ userId: created.id, role: "user" });
    });

    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}
