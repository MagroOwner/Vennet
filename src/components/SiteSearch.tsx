"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? pages.filter(([name, , detail]) => (name + " " + detail).toLowerCase().includes(term)) : pages;
  }, [query]);

  function findPage(event: React.FormEvent) {
    event.preventDefault();
    router.push(matches[0]?.[1] ?? "/help");
    setOpen(false);
  }

  return <form onSubmit={findPage} className="relative min-w-0">
    <label className="sr-only" htmlFor="site-search">Find a Vennet page</label>
    <div className="flex items-center rounded-2xl border border-slate-300 bg-slate-50 px-3 shadow-inner shadow-slate-900/[0.03]">
      <span aria-hidden="true" className="mr-2 text-slate-400">⌕</span>
      <input id="site-search" value={query} onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setOpen(true); }} placeholder="Find a page or tool" className="site-search-input min-w-0 flex-1 border-0 bg-transparent px-0 py-2.5 text-sm font-medium !text-slate-900 outline-none placeholder:!text-slate-500" />
      <button type="submit" className="ml-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-black text-slate-600 transition hover:border-emerald-300 hover:text-emerald-800">GO</button>
    </div>
    {open && <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/15">
      <p className="px-2 py-1.5 text-[10px] font-black uppercase tracking-[.14em] text-slate-500">{query ? "Matching pages" : "Browse pages"}</p>
      <div className="max-h-72 overflow-y-auto">
        {matches.length ? matches.map(([name, href, detail]) => <Link key={href} href={href} onMouseDown={() => setOpen(false)} className="block rounded-xl px-3 py-2.5 transition hover:bg-emerald-50"><span className="block text-sm font-black text-slate-900">{name}</span><span className="block text-xs text-slate-600">{detail}</span></Link>) : <p className="px-3 py-3 text-sm text-slate-600">No matching page. Open Help for guidance.</p>}
      </div>
    </div>}
  </form>;
}
