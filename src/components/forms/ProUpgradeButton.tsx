"use client";

import { useState } from "react";
import { startProCheckout } from "@/lib/actions/pro";

export function ProUpgradeButton({ hasIdentity, isPro = false }: { hasIdentity: boolean; isPro?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upgrade() {
    setBusy(true);
    setError(null);
    try {
      const result = await startProCheckout();
      if (!result.ok) { setError(result.error); return; }
      window.location.href = result.url;
    } finally {
      setBusy(false);
    }
  }

  return <div className="mt-8">
    {error && <p className="mb-3 text-sm text-red-300">{error}</p>}
    <button onClick={upgrade} disabled={busy || !hasIdentity} className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-50">
      {hasIdentity ? (busy ? "Opening secure checkout…" : isPro ? "Manage Pro billing" : "Upgrade to Vennet Pro") : "Create your profile first"}
      <span className="ml-2" aria-hidden="true">→</span>
    </button>
  </div>;
}
