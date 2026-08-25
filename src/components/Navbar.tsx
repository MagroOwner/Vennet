import Link from "next/link";
import { auth } from "@/lib/auth";
import { getIdentity } from "@/lib/queries";
import { SignOutButton } from "./SignOutButton";

export async function Navbar() {
  const session = await auth();
  const identity = session?.user?.id ? await getIdentity(session.user.id) : null;
  const role = session?.user?.role ?? "user";
  const nav = [
    ["Dashboard", "/dashboard"],
    ["Marketplace", "/marketplace"],
    ["Swift", "/dashboard/seller"],
    ["Disputes", "/disputes"],
  ] as const;

  return (
    <nav className="sticky top-0 z-20 border-b border-zinc-900 bg-[#090a0c]/95 text-zinc-100 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-3">
        <div className="flex items-center gap-7">
          <Link href="/" className="flex items-center gap-2 text-base font-black tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-md border border-zinc-800 bg-zinc-900 text-xs text-emerald-400">V</span>
            VENNET <span className="font-mono text-xs text-emerald-400">v1.2</span>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-md px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-100">
                {label}
              </Link>
            ))}
            {(role === "admin" || role === "moderator") && <Link href="/admin" className="rounded-md px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-emerald-400">Admin</Link>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {session ? <>
            <Link href="/settings" className="hidden rounded border border-zinc-800 px-3 py-1.5 font-mono text-xs text-zinc-300 sm:block">
              <span className="mr-2 text-emerald-400">●</span>{identity?.name ?? session.user?.email}
            </Link>
            <SignOutButton />
          </> : <Link href="/login" className="rounded border border-emerald-700 bg-emerald-950/30 px-3 py-1.5 font-mono text-xs text-emerald-400">Initialize session</Link>}
        </div>
      </div>
    </nav>
  );
}
