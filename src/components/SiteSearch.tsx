"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

  function findPage(event: React.FormEvent) {
    event.preventDefault();
    const term = query.trim().toLowerCase();
    const match = pages.find(([name, , detail]) => (name + " " + detail).toLowerCase().includes(term));
    router.push(match?.[1] ?? "/help");
  }

  return <form onSubmit={findPage} className="min-w-0">
    <label className="sr-only" htmlFor="site-search">Find a Vennet page</label>
    <div className="flex items-center rounded-2xl border border-slate-300 bg-slate-50 px-3 shadow-inner shadow-slate-900/[0.03]">
      <span aria-hidden="true" className="mr-2 text-slate-400">⌕</span>
      <input id="site-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a page or tool" className="min-w-0 flex-1 border-0 bg-transparent px-0 py-2.5 text-sm font-medium !text-slate-900 outline-none placeholder:!text-slate-500" />
      <button type="submit" className="ml-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-black text-slate-600 transition hover:border-emerald-300 hover:text-emerald-800">GO</button>
    </div>
  </form>;
}
