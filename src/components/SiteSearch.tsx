"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const pages = [
  ["Home", "/", "Your Vennet home"],
  ["Explore marketplace", "/marketplace", "Browse digital products and services"],
  ["Categories", "/collections", "Browse every digital collection"],
  ["Discover", "/discover", "Trending tools and featured creators"],
  ["My library", "/inventory", "Your purchased items and access details"],
  ["Saved offers", "/saved", "Products you want to revisit"],
  ["Cart", "/cart", "Review items before checkout"],
  ["Profile", "/profile", "Your creator profile and storefront"],
  ["Settings", "/settings", "Preferences and account settings"],
  ["Seller hub", "/dashboard/seller", "Listings, sales, payouts, and growth"],
  ["Vennet AI", "/ai", "Pro creator assistant"],
  ["Help center", "/help", "Guides for buying, selling, and delivery"],
];

export function SiteSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? pages.filter(([name, , detail]) => (name + " " + detail).toLowerCase().includes(term)).slice(0, 6) : pages.slice(0, 5);
  }, [query]);

  return <div className="relative min-w-0 flex-1">
    <label className="sr-only" htmlFor="site-search">Find a Vennet page</label>
    <div className="flex items-center rounded-2xl border border-slate-300 bg-slate-50 px-3 shadow-inner shadow-slate-900/[0.03] transition focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100">
      <span aria-hidden="true" className="mr-2 text-slate-400">⌕</span>
      <input id="site-search" value={query} onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setOpen(true); }} placeholder="Find a page or tool" className="min-w-0 flex-1 border-0 bg-transparent px-0 py-2.5 text-sm font-medium !text-slate-900 outline-none placeholder:!text-slate-500" />
      <span className="hidden rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-black text-slate-500 sm:inline">PAGES</span>
    </div>
    {open && <><button aria-label="Close page search" type="button" onClick={() => setOpen(false)} className="fixed inset-0 z-30 cursor-default" /><div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/15">{matches.length ? matches.map(([name, href, detail]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2.5 transition hover:bg-emerald-50"><p className="text-sm font-black text-slate-900">{name}</p><p className="mt-0.5 text-xs font-medium text-slate-500">{detail}</p></Link>) : <p className="px-3 py-4 text-sm font-semibold text-slate-500">No pages match “{query}”.</p>}</div></>}
  </div>;
}
