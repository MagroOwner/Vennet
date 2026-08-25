import { ReputationBadge } from "@/components/Badges";
import { getReputationLogs, getReputationScore } from "@/lib/queries";
import { levelForScore } from "@/lib/services/reputation";
import { requireSession } from "@/lib/session";
export const dynamic = "force-dynamic";

export default async function ReputationPage() {
  const { userId } = await requireSession("/reputation");
  const [score, logs] = await Promise.all([getReputationScore(userId), getReputationLogs(userId)]);
  const value = score?.score ?? 100;
  return <div className="console-page"><div><h1 className="text-3xl font-black">Reputation Ledger</h1><p className="mt-1 font-mono text-xs text-zinc-500">IMMUTABLE TRUST EVENTS // AUDITABLE HISTORY</p></div>
    <div className="grid gap-5 lg:grid-cols-[0.5fr_1.5fr]"><section className="console-panel p-6"><p className="console-kicker">reputation_index</p><p className="mt-5 font-mono text-5xl font-black text-emerald-400">{value}</p><div className="mt-3"><ReputationBadge score={value} level={score?.level ?? levelForScore(value)} /></div><p className="mt-6 font-mono text-xs text-zinc-500">{score?.totalEvents ?? 0} VERIFIED EVENTS</p></section>
    <section className="console-panel"><div className="console-panel-header"><h2 className="font-semibold"><span className="mr-2 text-emerald-400">⌁</span>Ledger Stream</h2><span className="console-kicker">stream_on</span></div><div className="space-y-2 p-3">{logs.length === 0 ? <div className="console-row text-sm text-zinc-500">No reputation events registered.</div> : logs.map((log) => <div key={log.id} className="console-row"><div><p className="font-mono text-sm font-bold uppercase">{log.type.replace(/_/g, " ")}</p><p className="mt-1 text-xs text-zinc-500">{log.reason}</p></div><div className="text-right"><p className={`font-mono font-bold ${log.delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>{log.delta >= 0 ? "+" : ""}{log.delta}</p><p className="mt-1 font-mono text-[10px] text-zinc-500">{log.createdAt.toLocaleDateString()}</p></div></div>)}</div></section></div>
  </div>;
}
