import Link from "next/link";
import { auth } from "@/lib/auth";
import { getIdentity } from "@/lib/queries";
import { SignOutButton } from "./SignOutButton";

export async function Navbar() {
  const session = await auth();
  const identity = session?.user?.id ? await getIdentity(session.user.id) : null;
  const role = session?.user?.role ?? "user";

  return (
    <nav className="sticky top-0 z-20 border-b border-zinc-900 bg-[#090a0c]/95 text-zinc-100 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-base font-black tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-md border border-zinc-800 bg-zinc-900 text-xs text-emerald-400">V</span>
          VENNET
        </Link>
        <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
          <Link href="/marketplace" className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white">Explore</Link>
          {session && <>
            <Link href="/dashboard/seller" className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white">Sell</Link>
            <Link href="/dashboard" className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white">My account</Link>
          </>}
          {(role === "admin" || role === "moderator") && <Link href="/admin" className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white">Admin</Link>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {session ? <>
            <Link href="/settings" className="hidden rounded border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 sm:block">{identity?.name ?? "Profile"}</Link>
            <SignOutButton />
          </> : <Link href="/login" className="rounded bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400">Sign in</Link>}
        </div>
      </div>
    </nav>
  );
}
