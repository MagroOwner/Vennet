"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { upgradeToPro } from "@/lib/callables";

const perks = [
  "Priority placement in marketplace search",
  "Lower platform fees on every sale",
  "Advanced seller analytics",
  "Pro badge on your identity and listings",
  "Priority dispute handling",
];

export default function ProPage() {
  return (
    <RequireAuth>
      <ProUpgrade />
    </RequireAuth>
  );
}

function ProUpgrade() {
  const { identity, refreshIdentity } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upgrade() {
    setBusy(true);
    setError(null);
    try {
      await upgradeToPro({});
      await refreshIdentity();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upgrade failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="text-4xl font-bold">
        Vennet <span className="text-emerald-400">Pro</span>
      </h1>
      <p className="mt-2 text-zinc-400">
        Everything you need to sell more and build trust faster.
      </p>

      <ul className="mt-8 space-y-3 rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-left">
        {perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2 text-zinc-300">
            <span className="text-emerald-400">✓</span> {perk}
          </li>
        ))}
      </ul>

      {identity?.isPro ? (
        <p className="mt-8 text-lg font-medium text-emerald-400">
          You&apos;re already a Pro member. 🎉
        </p>
      ) : (
        <>
          <button
            onClick={upgrade}
            disabled={busy}
            className="mt-8 w-full rounded-lg bg-emerald-600 py-3 font-medium hover:bg-emerald-500 disabled:opacity-50"
          >
            {busy ? "Upgrading…" : "Upgrade to Pro"}
          </button>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </>
      )}
    </div>
  );
}
