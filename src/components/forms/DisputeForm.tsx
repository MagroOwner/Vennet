"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createDispute } from "@/lib/actions/disputes";

export function DisputeForm({
  transactions,
}: {
  transactions: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [transactionId, setTransactionId] = useState(transactions[0]?.id ?? "");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await createDispute({ transactionId, reason });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setReason("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <select
        value={transactionId}
        onChange={(e) => setTransactionId(e.target.value)}
        className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
      >
        {transactions.map((transaction) => (
          <option key={transaction.id} value={transaction.id}>
            {transaction.label}
          </option>
        ))}
      </select>
      <textarea
        required
        rows={4}
        placeholder="Describe the issue"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded bg-emerald-600 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50"
      >
        {busy ? "Submitting…" : "Open dispute"}
      </button>
    </form>
  );
}
