"use client";

import { useState, useTransition } from "react";
import { createSellerBundle } from "@/lib/actions/community";

type Offer = { id: string; title: string };

export function BundleBuilder({ listings }: { listings: Offer[] }) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [discountPercent, setDiscountPercent] = useState("15");
  const [expiresAt, setExpiresAt] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  if (listings.length < 2) return <div className="rounded-2xl border border-white/10 bg-white/[.04] p-5 text-sm leading-6 text-slate-300">Publish at least two active offers to create a discounted bundle.</div>;
  function toggle(id: string) { setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 6 ? [...current, id] : current); }
  function submit(event: React.FormEvent) { event.preventDefault(); setMessage(""); startTransition(async () => { const result = await createSellerBundle({ name, listingIds: selected, discountPercent: Number(discountPercent), expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined }); if (result.ok) { setMessage("Bundle created. You can share it from your seller studio."); setName(""); setSelected([]); } else setMessage(result.error); }); }
  return <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/[.06] p-5"><p className="text-sm font-black text-white">Create a digital bundle</p><p className="mt-1 text-sm leading-5 text-slate-300">Pair two to six of your offers and set one bundle discount.</p><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Creator starter bundle" className="mt-4 w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2.5 text-sm font-bold text-white" /><div className="mt-3 max-h-36 space-y-2 overflow-y-auto">{listings.map((listing) => <label key={listing.id} className="flex items-center gap-2 text-sm text-slate-200"><input type="checkbox" checked={selected.includes(listing.id)} onChange={() => toggle(listing.id)} className="accent-emerald-400" /> <span className="truncate">{listing.title}</span></label>)}</div><div className="mt-3 grid grid-cols-2 gap-2"><input type="number" min="5" max="60" value={discountPercent} onChange={(event) => setDiscountPercent(event.target.value)} aria-label="Bundle discount percentage" className="rounded-xl border border-white/15 bg-slate-950 px-3 py-2.5 text-sm font-bold text-white" /><input type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} aria-label="Bundle expiry" className="rounded-xl border border-white/15 bg-slate-950 px-3 py-2.5 text-xs font-bold text-white" /></div><button disabled={pending || selected.length < 2} className="mt-3 w-full rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-black text-slate-950 disabled:opacity-50">{pending ? "Creating…" : "Create bundle"}</button>{message && <p className="mt-3 text-xs font-bold text-emerald-200">{message}</p>}</form>;
}
