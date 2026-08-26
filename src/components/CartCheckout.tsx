"use client";

import { useState } from "react";
import { removeCartItem } from "@/lib/actions/cart";
import { purchaseCart } from "@/lib/actions/marketplace";
import { formatPrice } from "@/lib/types";

type CartOffer = { id: string; title: string; priceCents: number; currency: string; sellerId: string };

export function CartCheckout({ listings }: { listings: CartOffer[] }) {
  const [items, setItems] = useState(listings);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const sellerCount = items.map((item) => item.sellerId).filter((seller, index, all) => all.indexOf(seller) === index).length;
  const subtotal = items.reduce((total, item) => total + item.priceCents, 0);
  async function remove(listingId: string) { const result = await removeCartItem(listingId); if (result.ok) setItems((current) => current.filter((item) => item.id !== listingId)); else setError(result.error); }
  async function checkout() { setBusy(true); setError(""); const result = await purchaseCart(); if (result.ok) window.location.assign(result.url); else { setError(result.error); setBusy(false); } }
  if (!items.length) return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">Your cart is empty.</div>;
  return <div className="grid gap-6 lg:grid-cols-[1.3fr_.7fr]"><section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">{items.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 border-b border-slate-100 p-5 last:border-0"><div><p className="font-black text-slate-950">{item.title}</p><p className="mt-1 text-sm font-bold text-emerald-700">{formatPrice(item.priceCents, item.currency)}</p></div><button type="button" onClick={() => remove(item.id)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700">Remove</button></div>)}</section><aside className="h-fit rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/15"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">Checkout</p><p className="mt-3 text-3xl font-black">{formatPrice(subtotal)}</p><p className="mt-2 text-sm leading-6 text-slate-300">{sellerCount === 1 ? "Secure Stripe checkout. The creator receives their payout and Vennet keeps its 5% platform fee." : "Your cart has offers from multiple creators. Remove items until one creator remains, then check out securely."}</p>{error && <p className="mt-4 rounded-xl bg-red-500/15 px-3 py-2 text-sm font-bold text-red-200">{error}</p>}<button type="button" disabled={busy || sellerCount !== 1} onClick={checkout} className="mt-5 w-full rounded-xl bg-emerald-300 px-4 py-3 text-sm font-black text-slate-950 disabled:opacity-50">{busy ? "Opening checkout…" : "Secure checkout"}</button></aside></div>;
}
