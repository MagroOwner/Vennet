import Link from "next/link";
import { auth } from "@/lib/auth";
import { getIdentity } from "@/lib/queries";
import { BrandMark } from "./BrandMark";
import { SignOutButton } from "./SignOutButton";

export async function Navbar() {
  const session = await auth();
  const identity = session?.user?.id ? await getIdentity(session.user.id) : null;
  const role = session?.user?.role ?? "user";

  return <nav className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#080b0b]/80 backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5">
      <Link href="/" className="group flex shrink-0 items-center gap-2.5 text-lg font-black tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl border border-emerald-400/25 bg-emerald-400/[0.07] shadow-lg shadow-emerald-400/10 transition group-hover:scale-105"><BrandMark className="h-7 w-7" /></span><span className="text-white">vennet</span></Link>
      <div className="hidden items-center gap-1 md:flex">
        <Link href="/marketplace" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.07] hover:text-white">Explore</Link>
        {session && <><Link href="/dashboard/seller" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.07] hover:text-white">Sell</Link><Link href="/inventory" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.07] hover:text-white">Inventory</Link><Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.07] hover:text-white">My account</Link></>}
        {(role === "admin" || role === "moderator") && <Link href="/admin" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.07] hover:text-white">Admin</Link>}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {session ? <><Link href="/settings" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.07] hover:text-white sm:block">{identity?.name ?? "Profile"}</Link><SignOutButton /></> : <Link href="/login" className="button-primary px-4 py-2 text-sm">Sign in</Link>}
      </div>
    </div>
  </nav>;
}
