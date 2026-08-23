"use client";

import { useEffect, useState } from "react";
import { getActiveListings } from "@/lib/services";
import { LISTING_CATEGORIES, type Listing, type ListingCategory } from "@/lib/types";
import { ListingCard } from "@/components/ListingCard";

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [category, setCategory] = useState<ListingCategory | "">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getActiveListings(category || undefined)
      .then(setListings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ListingCategory | "")}
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {LISTING_CATEGORIES.map((c) => (
            <option key={c} value={c} className="capitalize">
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="mt-12 text-center text-zinc-400">Loading listings…</p>
      ) : listings.length === 0 ? (
        <p className="mt-12 text-center text-zinc-400">No listings found.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
