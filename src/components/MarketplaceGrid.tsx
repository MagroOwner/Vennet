"use client";

import { useEffect, useMemo, useState } from "react";
import { ListingCard } from "@/components/ListingCard";
import type { Listing } from "@/lib/types";

type DisplaySize = "small" | "medium" | "large";
type Sort = "newest" | "price-low" | "price-high" | "popular";

const gridClasses: Record<DisplaySize, string> = {
  small: "grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  medium: "grid gap-5 sm:grid-cols-2 xl:grid-cols-3",
  large: "grid gap-6 md:grid-cols-2",
};

export function MarketplaceGrid({ listings, heading = "Explore offers", savedListingIds = [] }: { listings: Listing[]; heading?: string; savedListingIds?: string[] }) {
  const [size, setSize] = useState<DisplaySize>("medium");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");

  useEffect(() => {
    const saved = window.localStorage.getItem("vennet-marketplace-size") as DisplaySize | null;
    if (saved === "small" || saved === "medium" || saved === "large") setSize(saved);
  }, []);

  const visibleListings = useMemo(() => {
    const term = query.trim().toLowerCase();
    return [...listings]
      .filter((listing) => !term || (listing.title + " " + listing.description).toLowerCase().includes(term))
      .sort((a, b) => {
        if (sort === "price-low") return a.priceCents - b.priceCents;
        if (sort === "price-high") return b.priceCents - a.priceCents;
        if (sort === "popular") return b.purchaseCount - a.purchaseCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [listings, query, sort]);

  function chooseSize(nextSize: DisplaySize) {
    setSize(nextSize);
    window.localStorage.setItem("vennet-marketplace-size", nextSize);
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white/75 p-4 shadow-sm backdrop-blur sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><h2 className="text-xl font-black text-slate-950">{heading}</h2><p className="mt-1 text-sm text-slate-600">{visibleListings.length} of {listings.length} offers</p></div>
          <div className="inline-flex rounded-xl border border-slate-300 bg-white p-1 shadow-sm" aria-label="Listing display size">
            {(["small", "medium", "large"] as DisplaySize[]).map((option) => <button key={option} type="button" onClick={() => chooseSize(option)} className={size === option ? "rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold capitalize text-white" : "rounded-lg px-3 py-1.5 text-sm font-medium capitalize text-slate-600 transition hover:bg-slate-100"}>{option}</button>)}
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="sr-only" htmlFor="marketplace-search">Search offers</label>
          <input id="marketplace-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search templates, tools, creators, and services" className="rounded-xl border border-slate-300 bg-slate-950 px-4 py-3 text-sm text-white" />
          <select aria-label="Sort offers" value={sort} onChange={(event) => setSort(event.target.value as Sort)} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white">
            <option value="newest">Newest first</option><option value="popular">Most popular</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option>
          </select>
        </div>
      </div>
      {visibleListings.length === 0 ? <div className="mt-5 rounded-2xl border border-slate-200 bg-white/70 p-10 text-center shadow-sm"><p className="text-lg font-bold text-slate-950">No offers match that search.</p><button type="button" onClick={() => setQuery("")} className="mt-3 font-bold text-emerald-800 hover:text-emerald-950">Clear search</button></div> : <div className={"mt-5 " + gridClasses[size]}>{visibleListings.map((listing, index) => <div key={listing.id} className="animate-rise" style={{ animationDelay: Math.min(index * 55, 440) + "ms" }}><ListingCard listing={listing} size={size} saved={savedListingIds.includes(listing.id)} /></div>)}</div>}
    </>
  );
}
