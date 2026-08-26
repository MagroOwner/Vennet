"use client";

import { useEffect } from "react";

type RecentOffer = { id: string; title: string; price: string; imageUrl?: string };

export function RecentlyViewedTracker({ offer }: { offer: RecentOffer }) {
  useEffect(() => {
    const key = "vennet-recently-viewed";
    const current = JSON.parse(window.localStorage.getItem(key) ?? "[]") as RecentOffer[];
    const next = [offer, ...current.filter((item) => item.id !== offer.id)].slice(0, 8);
    window.localStorage.setItem(key, JSON.stringify(next));
  }, [offer]);
  return null;
}
