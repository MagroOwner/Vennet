import { ZodError } from "zod";
import { AuthError, PermissionError } from "@/lib/auth";
import type { ActionResult } from "@/lib/types";

/** Error whose message is safe to surface to the client. */
export class ActionError extends Error {}

export function failure(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    return { ok: false, error: error.issues[0]?.message ?? "Invalid input." };
  }
  if (
    error instanceof ActionError ||
    error instanceof AuthError ||
    error instanceof PermissionError
  ) {
    return { ok: false, error: error.message };
  }
  console.error("Unexpected action error", error);
  return { ok: false, error: "Something went wrong. Please try again." };
}
