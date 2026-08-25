"use client";

import { useState } from "react";
import { startProCheckout } from "@/lib/actions/pro";

export function ProUpgradeButton({ hasIdentity }: { hasIdentity: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upgrade() {
    setBusy(true); setError(null);
    try {
      const result = await startProCheckout();
      if (!result.ok) { setError(result.error); return; }
      window.location.href = result.url;
    } finally { setBusy(false); }
  }

  return <div className="mt-8">
    {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
    <button onClick={upgrade} disabled={busy || !hasIdentity} className="w-full rounded-lg bg-emerald-500 py-3 font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50">
      {hasIdentity ? (busy ? "Opening secure checkout…" : "Upgrade to Vennet Pro") : "Create an identity first"}
    </button>
    {hasIdentity && <p className="mt-3 text-center text-xs text-zinc-500">Secure monthly billing powered by Stripe. Cancel through Stripe at any time.</p>}
  </div>;
}
