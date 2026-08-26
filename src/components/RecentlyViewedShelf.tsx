"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type RecentOffer = { id: string; title: string; price: string; imageUrl?: string };

export function RecentlyViewedShelf() {
  const [offers, setOffers] = useState<RecentOffer[]>([]);
  useEffect(() => { setOffers(JSON.parse(window.localStorage.getItem("vennet-recently-viewed") ?? "[]") as RecentOffer[]); }, []);
  if (!offers.length) return null;
  return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700">Continue exploring</p><h2 className="mt-1 text-2xl font-black text-slate-950">Recently viewed</h2></div><Link href="/marketplace" className="text-sm font-black text-emerald-800">Browse more →</Link></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{offers.slice(0, 4).map((offer) => <Link key={offer.id} href={"/marketplace/" + offer.id} className="rounded-2xl border border-slate-200 p-3 transition hover:-translate-y-0.5 hover:border-emerald-300">{offer.imageUrl && <img src={offer.imageUrl} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />}<p className="mt-3 line-clamp-2 font-black text-slate-950">{offer.title}</p><p className="mt-1 text-sm font-bold text-emerald-700">{offer.price}</p></Link>)}</div></section>;
}
