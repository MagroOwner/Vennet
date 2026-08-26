"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SavedSearch = { id: string; label: string; query: string; collection: string; license: string; delivery: string; price: string };

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  useEffect(() => setSearches(JSON.parse(window.localStorage.getItem("vennet-saved-searches") ?? "[]") as SavedSearch[]), []);
  function remove(id: string) { const next = searches.filter((item) => item.id !== id); setSearches(next); window.localStorage.setItem("vennet-saved-searches", JSON.stringify(next)); }
  return <main className="mx-auto max-w-4xl space-y-7 pb-12"><section className="rounded-3xl bg-slate-950 px-7 py-9 text-white shadow-2xl shadow-slate-900/15"><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-300">Shop your way</p><h1 className="mt-2 text-4xl font-black">Saved searches</h1><p className="mt-3 max-w-xl text-slate-300">Return to the kinds of digital work you care about without starting your search from scratch.</p></section>{searches.length ? <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">{searches.map((search) => <div key={search.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-5 last:border-0"><div><p className="font-black text-slate-950">{search.label}</p><p className="mt-1 text-sm text-slate-600">{[search.collection, search.license, search.delivery, search.price].filter(Boolean).join(" · ") || "All marketplace offers"}</p></div><div className="flex gap-3"><Link href={"/marketplace?collection=" + encodeURIComponent(search.collection)} className="rounded-xl bg-emerald-300 px-4 py-2 text-sm font-black text-slate-950">Search now</Link><button type="button" onClick={() => remove(search.id)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700">Remove</button></div></div>)}</section> : <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="text-xl font-black text-slate-950">No saved searches yet.</p><p className="mt-2 text-sm text-slate-600">Use “Save this search” in the marketplace to keep your favorite discovery setup.</p><Link href="/marketplace" className="button-primary mt-5">Explore marketplace</Link></section>}</main>;
}
