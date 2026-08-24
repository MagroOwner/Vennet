import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Role } from "@/lib/types";

/** Server-side page guard: redirects to /login when unauthenticated. */
export async function requireSession(
  returnTo: string
): Promise<{ userId: string; email: string; role: Role }> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }
  return {
    userId: session.user.id,
    email: session.user.email ?? "",
    role: session.user.role,
  };
}

/** Server-side page guard for staff-only pages. */
export async function requireStaffSession(
  returnTo: string
): Promise<{ userId: string; email: string; role: Role }> {
  const current = await requireSession(returnTo);
  if (current.role !== "admin" && current.role !== "moderator") {
    redirect("/");
  }
  return current;
}
