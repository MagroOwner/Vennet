"use client";

import { useState } from "react";
import { startStripeIdentityVerification } from "@/lib/actions/stripe-identity";

export function StripeIdentityButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const result = await startStripeIdentityVerification();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.location.assign(result.url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6">
      <p className="max-w-xl text-sm leading-6 text-zinc-400">
        Vennet uses Stripe&apos;s secure hosted flow to verify your identity. Your verification documents are submitted directly to Stripe.
      </p>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      <button type="button" onClick={start} disabled={busy} className="button-primary mt-5 disabled:cursor-not-allowed disabled:opacity-50">
        {busy ? "Opening Stripe…" : "Verify with Stripe"}
      </button>
    </div>
  );
}
