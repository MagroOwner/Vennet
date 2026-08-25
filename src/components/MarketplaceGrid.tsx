"use client";

import { useEffect, useState } from "react";
import { ListingCard } from "@/components/ListingCard";
import type { Listing } from "@/lib/types";

type DisplaySize = "small" | "medium" | "large";

const gridClasses: Record<DisplaySize, string> = {
  small: "grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  medium: "grid gap-5 sm:grid-cols-2 xl:grid-cols-3",
  large: "grid gap-6 md:grid-cols-2",
};

export function MarketplaceGrid({ listings, heading = "Explore offers" }: { listings: Listing[]; heading?: string }) {
  const [size, setSize] = useState<DisplaySize>("medium");

  useEffect(() => {
    const saved = window.localStorage.getItem("vennet-marketplace-size") as DisplaySize | null;
    if (saved === "small" || saved === "medium" || saved === "large") setSize(saved);
  }, []);

  function chooseSize(nextSize: DisplaySize) {
    setSize(nextSize);
    window.localStorage.setItem("vennet-marketplace-size", nextSize);
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-xl font-bold text-slate-950">{heading}</h2><p className="mt-1 text-sm text-slate-600">{listings.length} available</p></div>
        <div className="inline-flex rounded-xl border border-slate-300 bg-white/75 p-1 shadow-sm" aria-label="Listing display size">
          {(["small", "medium", "large"] as DisplaySize[]).map((option) => <button key={option} type="button" onClick={() => chooseSize(option)} className={size === option ? "rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold capitalize text-white" : "rounded-lg px-3 py-1.5 text-sm font-medium capitalize text-slate-600 transition hover:bg-slate-100"}>{option}</button>)}
        </div>
      </div>
      <div className={"mt-5 " + gridClasses[size]}>{listings.map((listing) => <ListingCard key={listing.id} listing={listing} size={size} />)}</div>
    </>
  );
}
