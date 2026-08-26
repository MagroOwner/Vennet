import Link from "next/link";
import { auth } from "@/lib/auth";
import { getIdentity } from "@/lib/queries";
import { BrandMark } from "./BrandMark";
import { SignOutButton } from "./SignOutButton";

export async function Navbar() {
  const session = await auth();
  const identity = session?.user?.id ? await getIdentity(session.user.id) : null;
  const initial = (identity?.name ?? "P").slice(0, 1).toUpperCase();

  return <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-5 sm:px-5">
      <Link href="/" className="group flex shrink-0 items-center gap-2.5 text-lg font-black tracking-tight text-slate-950">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-200 bg-emerald-50 transition group-hover:scale-105"><BrandMark className="h-8 w-8" /></span>
        <span className="hidden sm:inline">vennet</span>
      </Link>
      <form action="/marketplace" className="order-3 flex min-w-0 flex-1 basis-full items-center rounded-2xl border border-slate-300 bg-slate-50 px-3 shadow-inner shadow-slate-900/[0.03] transition focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100 md:order-none md:basis-auto">
        <span aria-hidden="true" className="mr-2 text-slate-400">⌕</span>
        <label className="sr-only" htmlFor="site-search">Search Vennet</label>
        <input id="site-search" name="q" placeholder="Search Vennet" className="min-w-0 flex-1 border-0 bg-transparent px-0 py-2.5 text-sm font-medium !text-slate-900 outline-none placeholder:!text-slate-500" />
        <button type="submit" className="ml-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white transition hover:bg-emerald-800">Search</button>
      </form>
      <nav aria-label="Customer navigation" className="hidden shrink-0 items-center gap-1 lg:flex">
        <Link href="/marketplace" className="market-nav-link">Explore</Link>
        <Link href="/collections" className="market-nav-link">Categories</Link>
        <Link href="/discover" className="market-nav-link">Discover</Link>
        {session && <><Link href="/inventory" className="market-nav-link">My library</Link><Link href="/saved" className="market-nav-link">Saved</Link></>}
      </nav>
      <div className="flex shrink-0 items-center gap-2">
        {session ? <>
          <Link href="/cart" aria-label="Open cart" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-lg text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50">⌑</Link>
          <Link href="/profile" aria-label="Open profile" className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-bold text-slate-800 transition hover:border-emerald-300 sm:flex">{identity?.avatarUrl ? <img src={identity.avatarUrl} alt="" className="h-7 w-7 rounded-lg object-cover" /> : <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-400 text-xs font-black text-slate-950">{initial}</span>}<span className="max-w-24 truncate">{identity?.name ?? "Profile"}</span></Link>
          <SignOutButton />
        </> : <Link href="/login" className="button-primary px-4 py-2 text-sm">Sign in</Link>}
      </div>
    </div>
  </header>;
}
