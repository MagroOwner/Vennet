"use client";

import { useCallback, useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import {
  approveVerification,
  resolveDispute,
  adjustReputation,
} from "@/lib/callables";
import {
  getOpenDisputes,
  getPendingVerificationRequests,
  getFraudSignals,
} from "@/lib/services";
import type { Dispute, FraudSignal, VerificationRequest } from "@/lib/types";

type Tab = "disputes" | "verification" | "fraud" | "reputation";

export default function AdminPage() {
  return (
    <RequireAuth adminOnly>
      <AdminDashboard />
    </RequireAuth>
  );
}

function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("disputes");
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [signals, setSignals] = useState<FraudSignal[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const [d, r, s] = await Promise.all([
        getOpenDisputes(),
        getPendingVerificationRequests(),
        getFraudSignals(),
      ]);
      setDisputes(d);
      setRequests(r);
      setSignals(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data");
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "disputes", label: "Disputes", count: disputes.length },
    { id: "verification", label: "Verification", count: requests.length },
    { id: "fraud", label: "Fraud signals", count: signals.length },
    { id: "reputation", label: "Reputation" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold">Admin dashboard</h1>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-6 flex gap-2 border-b border-zinc-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm ${
              tab === t.id
                ? "border-b-2 border-emerald-500 text-emerald-400"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="ml-2 rounded-full bg-zinc-800 px-2 text-xs">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "disputes" && <DisputeQueue disputes={disputes} onDone={reload} />}
        {tab === "verification" && (
          <VerificationQueue requests={requests} onDone={reload} />
        )}
        {tab === "fraud" && <FraudList signals={signals} />}
        {tab === "reputation" && <ReputationTool />}
      </div>
    </div>
  );
}

function DisputeQueue({
  disputes,
  onDone,
}: {
  disputes: Dispute[];
  onDone: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function resolve(
    disputeId: string,
    outcome: "resolved_buyer" | "resolved_seller" | "dismissed"
  ) {
    const resolution = window.prompt("Resolution note:");
    if (!resolution) return;
    setBusyId(disputeId);
    try {
      await resolveDispute({ disputeId, outcome, resolution });
      onDone();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to resolve");
    } finally {
      setBusyId(null);
    }
  }

  if (disputes.length === 0) return <p className="text-zinc-400">No open disputes.</p>;

  return (
    <ul className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900">
      {disputes.map((d) => (
        <li key={d.id} className="px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-zinc-500">
              tx {d.transactionId.slice(0, 12)}…
            </span>
            <span className="text-xs capitalize text-amber-400">{d.status}</span>
          </div>
          <p className="mt-2 text-sm text-zinc-300">{d.reason}</p>
          <div className="mt-3 flex gap-2">
            <button
              disabled={busyId === d.id}
              onClick={() => resolve(d.id, "resolved_buyer")}
              className="rounded bg-emerald-700 px-3 py-1 text-xs hover:bg-emerald-600 disabled:opacity-50"
            >
              Refund buyer
            </button>
            <button
              disabled={busyId === d.id}
              onClick={() => resolve(d.id, "resolved_seller")}
              className="rounded bg-sky-700 px-3 py-1 text-xs hover:bg-sky-600 disabled:opacity-50"
            >
              Side with seller
            </button>
            <button
              disabled={busyId === d.id}
              onClick={() => resolve(d.id, "dismissed")}
              className="rounded bg-zinc-700 px-3 py-1 text-xs hover:bg-zinc-600 disabled:opacity-50"
            >
              Dismiss
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function VerificationQueue({
  requests,
  onDone,
}: {
  requests: VerificationRequest[];
  onDone: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function review(requestId: string, approve: boolean) {
    const reviewNote = window.prompt("Review note (optional):") ?? "";
    setBusyId(requestId);
    try {
      await approveVerification({ requestId, approve, reviewNote });
      onDone();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to review");
    } finally {
      setBusyId(null);
    }
  }

  if (requests.length === 0)
    return <p className="text-zinc-400">No pending verification requests.</p>;

  return (
    <ul className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900">
      {requests.map((r) => (
        <li key={r.id} className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{r.fullName}</p>
              <p className="text-xs capitalize text-zinc-500">
                {r.documentType.replace(/_/g, " ")} · uid {r.uid.slice(0, 8)}… ·{" "}
                {r.documentPaths.length} document(s)
              </p>
            </div>
            <div className="flex gap-2">
              <button
                disabled={busyId === r.id}
                onClick={() => review(r.id, true)}
                className="rounded bg-emerald-700 px-3 py-1 text-xs hover:bg-emerald-600 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                disabled={busyId === r.id}
                onClick={() => review(r.id, false)}
                className="rounded bg-red-700 px-3 py-1 text-xs hover:bg-red-600 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

const SEVERITY_COLORS = {
  low: "text-zinc-400",
  medium: "text-amber-400",
  high: "text-red-400",
} as const;

function FraudList({ signals }: { signals: FraudSignal[] }) {
  if (signals.length === 0) return <p className="text-zinc-400">No fraud signals.</p>;

  return (
    <ul className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900">
      {signals.map((s) => (
        <li key={s.id} className="px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm capitalize">{s.type.replace(/_/g, " ")}</span>
            <span className={`text-xs uppercase ${SEVERITY_COLORS[s.severity]}`}>
              {s.severity}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            uid {s.uid.slice(0, 12)}… — {s.details}
          </p>
        </li>
      ))}
    </ul>
  );
}

function ReputationTool() {
  const [targetUid, setTargetUid] = useState("");
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    setError(null);
    try {
      const res = await adjustReputation({
        targetUid,
        delta: parseInt(delta, 10),
        reason,
      });
      setResult(`New score: ${res.score}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Adjustment failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-4">
      <p className="text-sm text-zinc-400">
        Manually adjust a user&apos;s reputation. All adjustments are logged.
      </p>
      <input
        required
        placeholder="Target user UID"
        value={targetUid}
        onChange={(e) => setTargetUid(e.target.value)}
        className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
      />
      <input
        required
        type="number"
        min={-500}
        max={500}
        placeholder="Delta (e.g. -50 or 25)"
        value={delta}
        onChange={(e) => setDelta(e.target.value)}
        className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
      />
      <input
        required
        minLength={3}
        placeholder="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
      />
      {result && <p className="text-sm text-emerald-400">{result}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 disabled:opacity-50"
      >
        {busy ? "Applying…" : "Apply adjustment"}
      </button>
    </form>
  );
}
