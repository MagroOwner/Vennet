"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { createIdentity } from "@/lib/callables";
import { getPurchases } from "@/lib/services";
import { formatPrice, type Transaction } from "@/lib/types";
import { ReputationBadge, VerifiedBadge } from "@/components/Badges";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardView />
    </RequireAuth>
  );
}

function DashboardView() {
  const { user, identity, refreshIdentity } = useAuth();
  const [purchases, setPurchases] = useState<Transaction[]>([]);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getPurchases(user.uid).then(setPurchases).catch(console.error);
  }, [user]);

  async function submitIdentity(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await createIdentity({ name, bio });
      await refreshIdentity();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create identity");
    } finally {
      setBusy(false);
    }
  }

  if (!identity) {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold">Create your Vennet Identity</h1>
        <p className="mt-2 text-zinc-400">
          Your identity is your public trust profile across Vennet.
        </p>
        <form onSubmit={submitIdentity} className="mt-6 space-y-4">
          <input
            required
            minLength={2}
            maxLength={60}
            placeholder="Display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
          />
          <textarea
            maxLength={500}
            rows={4}
            placeholder="Bio (optional)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded bg-emerald-600 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create identity"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold">Identity</h2>
          <p className="mt-2 text-xl">{identity.name}</p>
          <div className="mt-2 flex gap-2">
            <VerifiedBadge status={identity.verificationStatus} />
            <ReputationBadge
              score={identity.reputationScore}
              level={
                identity.reputationScore >= 750
                  ? "platinum"
                  : identity.reputationScore >= 500
                    ? "gold"
                    : identity.reputationScore >= 300
                      ? "silver"
                      : identity.reputationScore >= 150
                        ? "bronze"
                        : "new"
              }
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Link href={`/identity/${identity.uid}`} className="text-emerald-400 hover:underline">
              Public profile
            </Link>
            <span className="text-zinc-600">·</span>
            <Link href="/settings" className="text-emerald-400 hover:underline">
              Edit
            </Link>
            {!identity.isPro && (
              <>
                <span className="text-zinc-600">·</span>
                <Link href="/pro" className="text-emerald-400 hover:underline">
                  Go Pro
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold">Verification</h2>
          <p className="mt-2 capitalize text-zinc-400">{identity.verificationStatus}</p>
          {identity.verificationStatus !== "verified" && (
            <Link
              href="/verification"
              className="mt-4 inline-block text-sm text-emerald-400 hover:underline"
            >
              {identity.verificationStatus === "pending"
                ? "View request status"
                : "Get verified"}
            </Link>
          )}
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold">Reputation</h2>
          <p className="mt-2 text-3xl font-bold text-emerald-400">
            {identity.reputationScore}
          </p>
          <Link
            href="/reputation"
            className="mt-4 inline-block text-sm text-emerald-400 hover:underline"
          >
            View history
          </Link>
        </div>
      </div>

      <h2 className="mt-10 text-xl font-semibold">Purchases</h2>
      {purchases.length === 0 ? (
        <p className="mt-4 text-zinc-400">
          No purchases yet.{" "}
          <Link href="/marketplace" className="text-emerald-400 hover:underline">
            Browse the marketplace
          </Link>
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900">
          {purchases.map((tx) => (
            <li key={tx.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <Link
                  href={`/marketplace/${tx.listingId}`}
                  className="text-sm text-emerald-400 hover:underline"
                >
                  Listing {tx.listingId.slice(0, 8)}…
                </Link>
                <p className="text-xs capitalize text-zinc-500">{tx.status}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm">
                  {formatPrice(tx.amountCents, tx.currency)}
                </span>
                {(tx.status === "paid" || tx.status === "paid_out") && (
                  <Link
                    href={`/disputes?tx=${tx.id}`}
                    className="text-xs text-zinc-400 hover:text-red-400"
                  >
                    Open dispute
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
