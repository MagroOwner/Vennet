import Link from "next/link";
import { auth } from "@/lib/auth";
import { getIdentity } from "@/lib/queries";
import { BrandMark } from "./BrandMark";
import { SellerSidebar } from "./SellerSidebar";
import { SignOutButton } from "./SignOutButton";
import { SiteSearch } from "./SiteSearch";

const customerButton = "rounded-xl border border-transparent px-3 py-2 text-sm font-black text-slate-700 transition hover:border-slate-200 hover:bg-slate-50 hover:text-emerald-800";

export async function Navbar() {
  const session = await auth();
  const identity = session?.user?.id ? await getIdentity(session.user.id) : null;
  const initial = (identity?.name ?? "P").slice(0, 1).toUpperCase();

  return <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5">
      <Link href="/" className="group flex shrink-0 items-center gap-2.5 text-lg font-black tracking-tight text-slate-950">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-200 bg-emerald-50 transition group-hover:scale-105"><BrandMark className="h-8 w-8" /></span>
        <span className="hidden sm:inline">vennet</span>
      </Link>
      <div className="order-3 basis-full md:order-none md:min-w-48 md:flex-1"><SiteSearch /></div>
      <nav aria-label="Customer navigation" className="hidden shrink-0 items-center gap-1 xl:flex">
        <Link href="/marketplace" className={customerButton}>Explore</Link>
        <Link href="/collections" className={customerButton}>Categories</Link>
        <Link href="/discover" className={customerButton}>Discover</Link>
        {session && <><Link href="/inventory" className={customerButton}>My library</Link><Link href="/saved" className={customerButton}>Saved</Link><Link href="/help" className={customerButton}>Help</Link></>}
      </nav>
      <div className="flex shrink-0 items-center gap-2">
        {session ? <>
          <div className="hidden lg:block"><SellerSidebar /></div>
          <Link href="/cart" aria-label="Open cart" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-lg text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50">⌑</Link>
          <Link href="/profile" aria-label="Open profile" className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-bold text-slate-800 transition hover:border-emerald-300 sm:flex">{identity?.avatarUrl ? <img src={identity.avatarUrl} alt="" className="h-7 w-7 rounded-lg object-cover" /> : <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-400 text-xs font-black text-slate-950">{initial}</span>}<span className="max-w-24 truncate">{identity?.name ?? "Profile"}</span></Link>
          <SignOutButton />
        </> : <Link href="/login" className="button-primary px-4 py-2 text-sm">Sign in</Link>}
      </div>
    </div>
    {session && <div className="border-t border-slate-100 px-4 py-2 lg:hidden"><SellerSidebar /></div>}
  </header>;
}
