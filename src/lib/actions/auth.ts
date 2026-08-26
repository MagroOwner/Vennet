"use server";

import { compare, hash } from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { randomInt } from "crypto";
import { connect } from "tls";
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
  return randomInt(100async function readSmtpResponse(socket: ReturnType<typeof connect>): Promise<string> {
  return new Promise((resolve, reject) => {
    let response = "";
    const timeout = setTimeout(() => reject(new Error("Timed out connecting to Gmail.")), 15_000);
    const onData = (chunk: Buffer) => {
      response += chunk.toString("utf8");
      if (/^\d{3} /m.test(response)) {
        clearTimeout(timeout);
        socket.off("error", onError);
        resolve(response);
      }
    };
    const onError = (error: Error) => {
      clearTimeout(timeout);
      socket.off("data", onData);
      reject(error);
    };
    socket.once("error", onError);
    socket.on("data", onData);
  });
}

async function smtpCommand(socket: ReturnType<typeof connect>, command: string) {
  socket.write(command + "\r\n");
  const response = await readSmtpResponse(socket);
  if (!/^2\d\d|^3\d\d/m.test(response)) throw new Error("Gmail rejected a verification email.");
}

async function sendVerificationEmail(email: string, code: string) {
  const gmailUser = process.env.GMAIL_USER;
  const appPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  if (!gmailUser || !appPassword) {
    throw new ActionError("Email verification is not configured yet. Add GMAIL_USER and GMAIL_APP_PASSWORD in Vercel.");
  }

  const socket = connect({ host: "smtp.gmail.com", port: 465, secure: true });
  try {
    const greeting = await readSmtpResponse(socket);
    if (!/^220/m.test(greeting)) throw new Error("Gmail did not accept the connection.");
    await smtpCommand(socket, "EHLO vennetofficial.vercel.app");
    await smtpCommand(socket, "AUTH PLAIN " + Buffer.from("\u0000" + gmailUser + "\u0000" + appPassword).toString("base64"));
    await smtpCommand(socket, "MAIL FROM:<" + gmailUser + ">");
    await smtpCommand(socket, "RCPT TO:<" + email + ">");
    await smtpCommand(socket, "DATA");
    const message = [
      "From: Vennet <" + gmailUser + ">",
      "To: " + email,
      "Subject: Your Vennet verification code",
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
      "",
      "Verify your Vennet email",
      "",
      "Enter this code to finish creating your account: " + code,
      "",
      "This code expires in 15 minutes. If you did not request it, you can ignore this email.",
      ".",
    ].join("\r\n");
    await smtpCommand(socket, message);
    socket.end("QUIT\r\n");
  } catch {
    socket.destroy();
    throw new ActionError("We could not send the verification email. Please try again shortly.");
  }
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
