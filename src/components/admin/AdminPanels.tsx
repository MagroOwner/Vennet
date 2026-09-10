"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { resolveDispute } from "@/lib/actions/disputes";
import { adjustReputation, calculateReputation } from "@/lib/actions/reputation";
import { approveVerification } from "@/lib/actions/verification";
import { DISPUTE_OUTCOMES, type DisputeOutcome } from "@/lib/types";

interface DisputeRow {
  id: string;
  reason: string;
  status: string;
  buyerId: string;
  sellerId: string;
  createdAt: string;
}

interface VerificationRow {
  id: string;
  userId: string;
  fullName: string;
  documentType: string;
  documentPaths: string[];
  createdAt: string;
}

interface FraudRow {
  id: string;
  userId: string;
  type: string;
  severity: string;
  details: string;
  createdAt: string;
}

type Tab = "disputes" | "verification" | "fraud" | "reputation";

const TABS: { key: Tab; label: string }[] = [
  { key: "disputes", label: "Disputes" },
  { key: "verification", label: "Verification" },
  { key: "fraud", label: "Fraud signals" },
  { key: "reputation", label: "Reputation" },
];

export function AdminPanels({
  isAdmin,
  disputes,
  verificationRequests,
  fraudSignals,
}: {
  isAdmin: boolean;
  disputes: DisputeRow[];
  verificationRequests: VerificationRow[];
  fraudSignals: FraudRow[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("disputes");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(true);
    setError(null);
    try {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Action failed.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6">
      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map((entry) => (
          <button
            key={entry.key}
            onClick={() => setTab(entry.key)}
            className={`px-4 py-2 text-sm ${
              tab === entry.key
                ? "border-b-2 border-emerald-500 text-emerald-800"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {tab === "disputes" && (
        <div className="mt-6 space-y-4">
          {disputes.length === 0 && <p className="text-slate-600">No open disputes.</p>}
          {disputes.map((dispute) => (
            <DisputeCard
              key={dispute.id}
              dispute={dispute}
              busy={busy}
              onResolve={(outcome, resolution) =>
                run(() => resolveDispute({ disputeId: dispute.id, outcome, resolution }))
              }
            />
          ))}
        </div>
      )}

      {tab === "verification" && (
        <div className="mt-6 space-y-4">
          {verificationRequests.length === 0 && (
            <p className="text-slate-600">No pending verification requests.</p>
          )}
          {verificationRequests.map((request) => (
            <div
              key={request.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="font-medium">{request.fullName}</p>
              <p className="text-xs text-slate-500">
                {request.documentType.replace(/_/g, " ")} · user {request.userId}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {request.documentPaths.map((path) => (
                  <a
                    key={path}
                    href={`/api/verification/document?path=${encodeURIComponent(path)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-800 hover:underline"
                  >
                    View document
                  </a>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  disabled={busy}
                  onClick={() =>
                    run(() => approveVerification({ requestId: request.id, approve: true }))
                  }
                  className="rounded-lg bg-emerald-400 px-3 py-2 text-sm font-bold text-emerald-950 hover:bg-emerald-300 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    run(() =>
                      approveVerification({ requestId: request.id, approve: false })
                    )
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "fraud" && (
        <div className="mt-6 space-y-3">
          {fraudSignals.length === 0 && <p className="text-slate-600">No fraud signals.</p>}
          {fraudSignals.map((signal) => (
            <div
              key={signal.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium capitalize">
                  {signal.type.replace(/_/g, " ")}
                </p>
                <span
                  className={`rounded px-2 py-0.5 text-xs capitalize ${
                    signal.severity === "high"
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-800"
                  }`}
                >
                  {signal.severity}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{signal.details}</p>
              <p className="mt-1 text-xs text-slate-500">user {signal.userId}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "reputation" && (
        <ReputationPanel
          isAdmin={isAdmin}
          busy={busy}
          onRecalculate={(targetUserId) =>
            run(() => calculateReputation({ targetUserId }))
          }
          onAdjust={(targetUserId, delta, reason) =>
            run(() => adjustReputation({ targetUserId, delta, reason }))
          }
        />
      )}
    </div>
  );
}

function DisputeCard({
  dispute,
  busy,
  onResolve,
}: {
  dispute: DisputeRow;
  busy: boolean;
  onResolve: (outcome: DisputeOutcome, resolution: string) => void;
}) {
  const [outcome, setOutcome] = useState<DisputeOutcome>("resolved_buyer");
  const [resolution, setResolution] = useState("");

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium capitalize">
          {dispute.status.replace(/_/g, " ")}
        </p>
        <p className="text-xs text-slate-500">
          {new Date(dispute.createdAt).toLocaleDateString()}
        </p>
      </div>
      <p className="mt-1 text-sm text-slate-700">{dispute.reason}</p>
      <p className="mt-1 text-xs text-slate-500">
        buyer {dispute.buyerId} · seller {dispute.sellerId}
      </p>
      <div className="mt-3 space-y-2">
        <select
          value={outcome}
          onChange={(e) => setOutcome(e.target.value as DisputeOutcome)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        >
          {DISPUTE_OUTCOMES.map((option) => (
            <option key={option} value={option}>
              {option.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <textarea
          rows={2}
          placeholder="Resolution note"
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
        <button
          disabled={busy}
          onClick={() => onResolve(outcome, resolution)}
          className="rounded-lg bg-emerald-400 px-3 py-2 text-sm font-bold text-emerald-950 hover:bg-emerald-300 disabled:opacity-50"
        >
          Resolve
        </button>
      </div>
    </div>
  );
}

function ReputationPanel({
  isAdmin,
  busy,
  onRecalculate,
  onAdjust,
}: {
  isAdmin: boolean;
  busy: boolean;
  onRecalculate: (targetUserId: string) => void;
  onAdjust: (targetUserId: string, delta: number, reason: string) => void;
}) {
  const [targetUserId, setTargetUserId] = useState("");
  const [delta, setDelta] = useState("0");
  const [reason, setReason] = useState("");

  if (!isAdmin) {
    return <p className="mt-6 text-slate-600">Reputation tools require admin access.</p>;
  }

  return (
    <div className="mt-6 max-w-md space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <input
        placeholder="Target user ID"
        value={targetUserId}
        onChange={(e) => setTargetUserId(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
      />
      <button
        disabled={busy || targetUserId === ""}
        onClick={() => onRecalculate(targetUserId)}
        className="w-full rounded-lg border border-slate-300 bg-white py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
      >
        Recalculate from logs
      </button>
      <input
        type="number"
        placeholder="Delta"
        value={delta}
        onChange={(e) => setDelta(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
      />
      <input
        placeholder="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
      />
      <button
        disabled={busy || targetUserId === ""}
        onClick={() => onAdjust(targetUserId, Number(delta), reason)}
        className="w-full rounded-lg bg-emerald-400 py-2 text-sm font-bold text-emerald-950 hover:bg-emerald-300 disabled:opacity-50"
      >
        Apply adjustment
      </button>
    </div>
  );
}
