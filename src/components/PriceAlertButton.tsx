"use client";

import { useState } from "react";
import { togglePriceAlert } from "@/lib/actions/community";

export function PriceAlertButton({ listingId }: { listingId: string }) {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  async function toggle() {
    setBusy(true);
    const result = await togglePriceAlert(listingId);
    if (result.ok) setEnabled(result.enabled);
    setBusy(false);
  }
  return <button type="button" onClick={toggle} disabled={busy} className={enabled ? "rounded-xl bg-amber-100 px-3 py-2 text-sm font-black text-amber-900" : "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-amber-400"}>{enabled ? "Price alerts on" : "Alert me about price drops"}</button>;
}
