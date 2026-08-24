import Link from "next/link";
import { auth } from "@/lib/auth";
import { getIdentity } from "@/lib/queries";
import { SignOutButton } from "./SignOutButton";

export async function Navbar() {
  const session = await auth();
  const identity = session?.user?.id ? await getIdentity(session.user.id) : null;
  const role = session?.user?.role ?? "user";

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight text-emerald-400">
            Vennet
          </Link>
          <Link href="/marketplace" className="text-sm hover:text-emerald-400">
            Marketplace
          </Link>
          {session && (
            <>
              <Link href="/dashboard" className="text-sm hover:text-emerald-400">
                Dashboard
              </Link>
              <Link href="/dashboard/seller" className="text-sm hover:text-emerald-400">
                Sell
              </Link>
              <Link href="/disputes" className="text-sm hover:text-emerald-400">
                Disputes
              </Link>
            </>
          )}
          {(role === "admin" || role === "moderator") && (
            <Link href="/admin" className="text-sm text-amber-400 hover:text-amber-300">
              Admin
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          {session ? (
            <>
              {identity?.isPro && (
                <span className="rounded bg-emerald-600 px-2 py-0.5 text-xs font-semibold">
                  PRO
                </span>
              )}
              <Link href="/settings" className="text-sm hover:text-emerald-400">
                {identity?.name ?? session.user?.email}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded bg-emerald-600 px-3 py-1 text-sm font-medium hover:bg-emerald-500"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
