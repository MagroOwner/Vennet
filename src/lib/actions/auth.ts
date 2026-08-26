"use server";

import { compare, hash } from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { randomInt } from "crypto";
import { z } from "zod";
import { ActionError, failure } from "@/lib/action-error";
import { db } from "@/lib/db";
import { emailVerificationTokens, roles, users } from "@/lib/db/schema";
import type { ActionResult } from "@/lib/types";

const signUpSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(200),
  displayName: z.string().trim().max(80).default(""),
});

const confirmEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the six-digit code from your email."),
});

function createCode() {
  return randomInt(100000, 1_000_000).toString();
}

async function sendVerificationEmail(email: string, code: string) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  const fromName = process.env.SENDGRID_FROM_NAME ?? "Vennet";
  if (!apiKey || !fromEmail) {
    throw new ActionError("Email verification is not configured yet. Add SENDGRID_API_KEY and SENDGRID_FROM_EMAIL in Vercel.");
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email }] }],
      from: { email: fromEmail, name: fromName },
      subject: "Your Vennet verification code",
      content: [{
        type: "text/plain",
        value: "Verify your Vennet email\n\nEnter this code to finish creating your account: " + code + "\n\nThis code expires in 15 minutes. If you did not request it, you can ignore this email.",
      }],
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new ActionError("We could not send the verification email. Please try again shortly.");
}

export async function beginRegistration(
  input: z.input<typeof signUpSchema>
): Promise<ActionResult> {
  try {
    const data = signUpSchema.parse(input);
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, data.email)).limit(1);
    if (existing) throw new ActionError("An account with that email already exists.");

    const [recent] = await db
      .select({ email: emailVerificationTokens.email })
      .from(emailVerificationTokens)
      .where(and(eq(emailVerificationTokens.email, data.email), gt(emailVerificationTokens.createdAt, new Date(Date.now() - 60_000))))
      .limit(1);
    if (recent) throw new ActionError("Please wait a minute before requesting another code.");

    const code = createCode();
    const [passwordHash, codeHash] = await Promise.all([hash(data.password, 12), hash(code, 10)]);
    await db
      .insert(emailVerificationTokens)
      .values({
        email: data.email,
        passwordHash,
        displayName: data.displayName,
        codeHash,
        expiresAt: new Date(Date.now() + 15 * 60_000),
        attempts: 0,
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: emailVerificationTokens.email,
        set: {
          passwordHash,
          displayName: data.displayName,
          codeHash,
          expiresAt: new Date(Date.now() + 15 * 60_000),
          attempts: 0,
          createdAt: new Date(),
        },
      });
    await sendVerificationEmail(data.email, code);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function completeRegistration(
  input: z.input<typeof confirmEmailSchema>
): Promise<ActionResult> {
  try {
    const data = confirmEmailSchema.parse(input);
    const [pending] = await db
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.email, data.email))
      .limit(1);
    if (!pending || pending.expiresAt < new Date()) {
      throw new ActionError("That code has expired. Request a new one to continue.");
    }
    if (pending.attempts >= 5) {
      throw new ActionError("Too many incorrect attempts. Request a new verification code.");
    }
    if (!(await compare(data.code, pending.codeHash))) {
      await db.update(emailVerificationTokens).set({ attempts: pending.attempts + 1 }).where(eq(emailVerificationTokens.email, data.email));
      throw new ActionError("That verification code is not correct.");
    }

    await db.transaction(async (tx) => {
      const [existing] = await tx.select({ id: users.id }).from(users).where(eq(users.email, data.email)).limit(1);
      if (existing) throw new ActionError("An account with that email already exists.");
      const [created] = await tx
        .insert(users)
        .values({ email: pending.email, passwordHash: pending.passwordHash, displayName: pending.displayName, emailVerified: new Date() })
        .returning({ id: users.id });
      await tx.insert(roles).values({ userId: created.id, role: "user" });
      await tx.delete(emailVerificationTokens).where(eq(emailVerificationTokens.email, data.email));
    });
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}
