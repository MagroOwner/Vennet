"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { getReputationLogs, getReputationScore } from "@/lib/services";
import type { ReputationLog, ReputationScore } from "@/lib/types";
import { ReputationBadge } from "@/components/Badges";

export default function ReputationPage() {
  return (
    <RequireAuth>
      <ReputationView />
    </RequireAuth>
  );
}

function ReputationView() {
  const { user } = useAuth();
  const [score, setScore] = useState<ReputationScore | null>(null);
  const [logs, setLogs] = useState<ReputationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([getReputationScore(user.uid), getReputationLogs(user.uid)])
      .then(([s, l]) => {
        setScore(s);
        setLogs(l);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p className="text-center text-zinc-400">Loading…</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold">Reputation</h1>
      {score ? (
        <div className="mt-6 flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <span className="text-5xl font-bold text-emerald-400">{score.score}</span>
          <div>
            <ReputationBadge score={score.score} level={score.level} />
            <p className="mt-1 text-sm text-zinc-400">
              {score.totalEvents} reputation events
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-6 text-zinc-400">
          No reputation yet — create your identity to start building trust.
        </p>
      )}

      <h2 className="mt-10 text-xl font-semibold">History</h2>
      {logs.length === 0 ? (
        <p className="mt-4 text-zinc-400">No reputation events yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900">
          {logs.map((log) => (
            <li key={log.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm capitalize">{log.type.replace(/_/g, " ")}</p>
                <p className="text-xs text-zinc-500">{log.reason}</p>
              </div>
              <span
                className={`font-mono text-sm ${
                  log.delta >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {log.delta >= 0 ? `+${log.delta}` : log.delta}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
