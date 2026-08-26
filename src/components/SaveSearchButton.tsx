"use client";

import { useState } from "react";

export function SaveSearchButton({ query, collection, license, delivery, price }: { query: string; collection: string; license: string; delivery: string; price: string }) {
  const [saved, setSaved] = useState(false);
  function save() {
    const key = "vennet-saved-searches";
    const searches = JSON.parse(window.localStorage.getItem(key) ?? "[]") as Array<{ id: string; label: string; query: string; collection: string; license: string; delivery: string; price: string }>;
    const current = { id: [query, collection, license, delivery, price].join("|"), label: query || collection || "Marketplace search", query, collection, license, delivery, price };
    const next = [current, ...searches.filter((item) => item.id !== current.id)].slice(0, 12);
    window.localStorage.setItem(key, JSON.stringify(next));
    setSaved(true);
  }
  return <button type="button" onClick={save} className="text-sm font-bold text-emerald-800 hover:text-emerald-950">{saved ? "Search saved ✓" : "Save this search"}</button>;
}
