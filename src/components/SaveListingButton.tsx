"use client";

import { useState } from "react";
import { toggleSavedListing } from "@/lib/actions/community";

export function SaveListingButton({ listingId, initiallySaved = false }: { listingId: string; initiallySaved?: boolean }) {
  const [saved, setSaved] = useState(initiallySaved);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const result = await toggleSavedListing(listingId);
    if (result.ok) setSaved(result.saved);
    setBusy(false);
  }

  return <button type="button" onClick={toggle} disabled={busy} aria-label={saved ? "Remove from saved items" : "Save this listing"} className={saved ? "rounded-lg bg-rose-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-rose-600 disabled:opacity-50" : "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 transition hover:border-emerald-400 hover:text-emerald-800 disabled:opacity-50"}>{saved ? "Saved ♥" : "Save ♡"}</button>;
}
