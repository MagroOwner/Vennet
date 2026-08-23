"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { stripeOnboard } from "@/lib/callables";
import { getStripeAccount } from "@/lib/services";
import type { StripeAccount } from "@/lib/types";

export default function StripeOnboardingPage() {
  return (
    <RequireAuth>
      <StripeOnboarding />
    </RequireAuth>
  );
}

function StripeOnboarding() {
  const { user } = useAuth();
  const [account, setAccount] = useState<StripeAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getStripeAccount(user.uid)
      .then(setAccount)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  async function startOnboarding() {
    setBusy(true);
    setError(null);
    try {
      const origin = window.location.origin;
      const res = await stripeOnboard({
        returnUrl: `${origin}/stripe/onboarding?status=complete`,
        refreshUrl: `${origin}/stripe/onboarding?status=refresh`,
      });
      window.location.href = res.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onboarding failed");
      setBusy(false);
    }
  }

  if (loading) return <p className="text-center text-zinc-400">Loading…</p>;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold">Payout setup</h1>
      <p className="mt-2 text-zinc-400">
        Vennet uses Stripe Connect to send your sales revenue directly to your
        bank account.
      </p>

      <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        {account?.chargesEnabled && account?.payoutsEnabled ? (
          <p className="font-medium text-emerald-400">
            ✓ Stripe account connected — you&apos;re ready to sell.
          </p>
        ) : account ? (
          <>
            <p className="text-amber-400">
              Onboarding started but not complete.
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Charges: {account.chargesEnabled ? "enabled" : "disabled"} · Payouts:{" "}
              {account.payoutsEnabled ? "enabled" : "disabled"}
            </p>
          </>
        ) : (
          <p className="text-zinc-300">No Stripe account connected yet.</p>
        )}

        {!(account?.chargesEnabled && account?.payoutsEnabled) && (
          <button
            onClick={startOnboarding}
            disabled={busy}
            className="mt-4 w-full rounded bg-emerald-600 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50"
          >
            {busy ? "Redirecting…" : account ? "Continue onboarding" : "Connect with Stripe"}
          </button>
        )}
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
