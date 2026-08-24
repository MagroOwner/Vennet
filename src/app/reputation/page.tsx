import { ReputationBadge } from "@/components/Badges";
import { getReputationLogs, getReputationScore } from "@/lib/queries";
import { levelForScore } from "@/lib/services/reputation";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ReputationPage() {
  const { userId } = await requireSession("/reputation");
  const [score, logs] = await Promise.all([
    getReputationScore(userId),
    getReputationLogs(userId),
  ]);
  const value = score?.score ?? 100;

  return (
    <div>
      <h1 className="text-3xl font-bold">Reputation</h1>
      <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-4xl font-bold text-emerald-400">{value}</p>
        <div className="mt-2">
          <ReputationBadge score={value} level={score?.level ?? levelForScore(value)} />
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          {score?.totalEvents ?? 0} recorded events
        </p>
      </div>

      <h2 className="mt-8 text-xl font-semibold">History</h2>
      {logs.length === 0 ? (
        <p className="mt-4 text-zinc-400">No reputation history yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-800 rounded-lg border border-zinc-800">
          {logs.map((log) => (
            <li key={log.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium capitalize">
                  {log.type.replace(/_/g, " ")}
                </p>
                <p className="text-xs text-zinc-500">{log.reason}</p>
              </div>
              <div className="text-right">
                <span
                  className={`font-semibold ${log.delta >= 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {log.delta >= 0 ? "+" : ""}
                  {log.delta}
                </span>
                <p className="text-xs text-zinc-500">
                  {log.createdAt.toLocaleDateString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
