"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toggleCartItem } from "@/lib/actions/cart";

export function CartButton({ listingId, signedIn }: { listingId: string; signedIn: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  async function add() {
    if (!signedIn) { router.push("/login?next=/marketplace/" + listingId); return; }
    setBusy(true);
    const result = await toggleCartItem(listingId);
    if (result.ok) setNotice(result.inCart ? "Added to cart." : "Removed from cart.");
    else setNotice(result.error);
    setBusy(false);
  }
  return <div><button type="button" disabled={busy} onClick={add} className="w-full rounded-xl border border-slate-300 bg-white py-3 text-sm font-black text-slate-900 transition hover:border-emerald-400 hover:text-emerald-800 disabled:opacity-50">{busy ? "Adding…" : "Add to cart"}</button>{notice && <p className="mt-2 text-center text-xs font-bold text-emerald-700">{notice}</p>}</div>;
}
