"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { createDispute } from "@/lib/callables";
import { getMyDisputes } from "@/lib/services";
import type { Dispute } from "@/lib/types";

export default function DisputesPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<p className="text-center text-zinc-400">Loading…</p>}>
        <DisputeCenter />
      </Suspense>
    </RequireAuth>
  );
}

const STATUS_LABELS: Record<Dispute["status"], string> = {
  open: "Open",
  under_review: "Under review",
  resolved_buyer: "Resolved for buyer",
  resolved_seller: "Resolved for seller",
  dismissed: "Dismissed",
};

function DisputeCenter() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const txFromQuery = searchParams.get("tx") ?? "";

  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [transactionId, setTransactionId] = useState(txFromQuery);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getMyDisputes(user.uid).then(setDisputes).catch(console.error);
  }, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await createDispute({ transactionId, reason });
      setTransactionId("");
      setReason("");
      setDisputes(await getMyDisputes(user.uid));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open dispute");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Dispute center</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold">Open a dispute</h2>
          <p className="mt-1 text-sm text-zinc-400">
            As a buyer you can dispute a paid transaction. An admin will review
            both sides and resolve it.
          </p>
          <form onSubmit={submit} className="mt-4 space-y-4">
            <input
              required
              placeholder="Transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
            />
            <textarea
              required
              minLength={10}
              maxLength={2000}
              rows={5}
              placeholder="Describe the issue (min 10 characters)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded bg-red-600 py-2 font-medium hover:bg-red-500 disabled:opacity-50"
            >
              {busy ? "Submitting…" : "Open dispute"}
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Your disputes</h2>
          {disputes.length === 0 ? (
            <p className="mt-4 text-zinc-400">No disputes.</p>
          ) : (
            <ul className="mt-4 divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900">
              {disputes.map((d) => (
                <li key={d.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {user?.uid === d.buyerId ? "You vs seller" : "Buyer vs you"}
                    </span>
                    <span
                      className={`text-sm ${
                        d.status === "open" || d.status === "under_review"
                          ? "text-amber-400"
                          : "text-zinc-400"
                      }`}
                    >
                      {STATUS_LABELS[d.status]}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{d.reason}</p>
                  {d.resolution && (
                    <p className="mt-1 text-xs text-emerald-400">
                      Resolution: {d.resolution}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
