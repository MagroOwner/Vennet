"use client";

import { useState } from "react";
import { stripeOnboard } from "@/lib/actions/stripe";

export function StripeOnboardButton({ existing }: { existing: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    const result = await stripeOnboard();
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    window.location.href = result.url;
  }

  return (
    <div className="mt-6">
      {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
      <button
        onClick={start}
        disabled={busy}
        className="w-full rounded-lg bg-emerald-600 py-3 font-medium hover:bg-emerald-500 disabled:opacity-50"
      >
        {busy
          ? "Redirecting…"
          : existing
            ? "Continue Stripe onboarding"
            : "Connect with Stripe"}
      </button>
    </div>
  );
}
