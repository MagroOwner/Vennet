"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/types";

type Offer = { id: string; title: string; priceCents: number; currency: string; category: string; imageUrl?: string };

export default function ComparePage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  useEffect(() => setOffers(JSON.parse(window.localStorage.getItem("vennet-compare") ?? "[]") as Offer[]), []);
  function remove(id: string) { const next = offers.filter((offer) => offer.id !== id); setOffers(next); window.localStorage.setItem("vennet-compare", JSON.stringify(next)); }
  return <main className="mx-auto max-w-6xl space-y-7 pb-12"><section className="rounded-3xl bg-slate-950 px-7 py-9 text-white shadow-2xl shadow-slate-900/15"><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-300">Decide with confidence</p><h1 className="mt-2 text-4xl font-black">Compare offers</h1><p className="mt-3 text-slate-300">Keep up to three digital offers side by side while you choose the right fit.</p></section>{offers.length ? <section className="grid gap-5 md:grid-cols-3">{offers.map((offer) => <article key={offer.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">{offer.imageUrl && <img src={offer.imageUrl} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" />}<p className="mt-4 text-xl font-black text-slate-950">{offer.title}</p><dl className="mt-5 space-y-3 border-y border-slate-100 py-4 text-sm"><div className="flex justify-between gap-3"><dt className="text-slate-600">Price</dt><dd className="font-black text-emerald-700">{formatPrice(offer.priceCents, offer.currency)}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-600">Offer type</dt><dd className="font-bold capitalize text-slate-900">{offer.category}</dd></div></dl><Link href={"/marketplace/" + offer.id} className="button-primary mt-5 w-full justify-center">View offer</Link><button type="button" onClick={() => remove(offer.id)} className="mt-3 w-full text-sm font-bold text-slate-600">Remove</button></article>)}</section> : <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="text-xl font-black text-slate-950">Nothing to compare yet.</p><p className="mt-2 text-sm text-slate-600">Use Compare on marketplace cards to keep up to three offers here.</p><Link href="/marketplace" className="button-primary mt-5">Explore marketplace</Link></section>}</main>;
}
