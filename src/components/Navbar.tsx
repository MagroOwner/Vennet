import Link from "next/link";
import { auth } from "@/lib/auth";
import { getIdentity } from "@/lib/queries";
import { BrandMark } from "./BrandMark";
import { SignOutButton } from "./SignOutButton";

export async function Navbar() {
  const session = await auth();
  const identity = session?.user?.id ? await getIdentity(session.user.id) : null;
  const role = session?.user?.role ?? "user";
  const initial = (identity?.name ?? "P").slice(0, 1).toUpperCase();

  return <nav className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#080b0b]/80 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5">
    <Link href="/" className="group flex shrink-0 items-center gap-2.5 text-lg font-black tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl border border-emerald-400/25 bg-emerald-400/[0.07] shadow-lg shadow-emerald-400/10 transition group-hover:scale-105"><BrandMark className="h-7 w-7" /></span><span className="text-white">vennet</span></Link>
    <div className="hidden items-center gap-1 lg:flex"><Link href="/marketplace" className="top-nav-link">Explore</Link>{session && <><Link href="/dashboard/seller" className="top-nav-link">Sell</Link><Link href="/inventory" className="top-nav-link">Inventory</Link><Link href="/saved" className="top-nav-link">Saved</Link><Link href="/dashboard" className="top-nav-link">Dashboard</Link>{identity?.isPro && <Link href="/ai" className="top-nav-link text-emerald-200">AI <span className="ml-1 rounded bg-emerald-300 px-1 py-0.5 text-[9px] font-black text-slate-950">PRO</span></Link>}<Link href="/profile" className="top-nav-link">Profile</Link><Link href="/settings" className="top-nav-link">Settings</Link></>}{(role === "admin" || role === "moderator") && <Link href="/admin" className="top-nav-link">Admin</Link>}</div>
    <div className="flex shrink-0 items-center gap-3">{session ? <><Link href="/profile" aria-label="Open profile" className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-3 text-sm font-semibold text-white transition hover:border-emerald-300/35 hover:bg-white/[0.08] sm:flex">{identity?.avatarUrl ? <img src={identity.avatarUrl} alt="" className="h-7 w-7 rounded-lg object-cover" /> : <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-400 text-xs font-black text-slate-950">{initial}</span>}<span>{identity?.name ?? "Profile"}</span></Link><SignOutButton /></> : <Link href="/login" className="button-primary px-4 py-2 text-sm">Sign in</Link>}</div>
  </div></nav>;
}
