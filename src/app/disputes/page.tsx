import { DisputeForm } from "@/components/forms/DisputeForm";
import { getMyDisputes, getPurchases } from "@/lib/queries";
import { requireSession } from "@/lib/session";
import { formatPrice } from "@/lib/types";
export const dynamic = "force-dynamic";

export default async function DisputesPage() {
  const { userId } = await requireSession("/disputes");
  const [myDisputes, purchases] = await Promise.all([getMyDisputes(userId), getPurchases(userId)]);
  const disputedTransactionIds = new Set(myDisputes.map((d) => d.transactionId));
  const disputable = purchases.filter((transaction) => (transaction.status === "paid" || transaction.status === "disputed") && !disputedTransactionIds.has(transaction.id));
  return <div className="console-page mx-auto max-w-5xl"><div><h1 className="text-3xl font-black">Dispute Arbitration</h1><p className="mt-1 font-mono text-xs text-zinc-500">RESOLUTION PROTOCOL // BUYER PROTECTION CHANNEL</p></div>
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]"><section className="console-panel p-6"><p className="console-kicker">open_dispute_protocol</p><h2 className="mt-3 text-xl font-bold">Initiate a case</h2>{disputable.length === 0 ? <p className="mt-5 text-sm text-zinc-500">No eligible purchase records found.</p> : <div className="mt-5"><DisputeForm transactions={disputable.map((transaction) => ({ id: transaction.id, label: `${formatPrice(transaction.amountCents, transaction.currency)} · ${transaction.createdAt.toLocaleDateString()}` }))} /></div>}</section>
    <section className="console-panel"><div className="console-panel-header"><h2 className="font-semibold">Case Ledger</h2><span className="console-kicker">{myDisputes.length} cases</span></div><div className="space-y-2 p-3">{myDisputes.length === 0 ? <div className="console-row text-sm text-zinc-500">No disputes registered.</div> : myDisputes.map((dispute) => <div key={dispute.id} className="console-row"><div><p className="font-mono text-xs text-emerald-400">CASE-{dispute.id.slice(0, 8).toUpperCase()}</p><p className="mt-1 text-sm text-zinc-300">{dispute.reason}</p>{dispute.resolution && <p className="mt-1 text-xs text-emerald-400">Resolution: {dispute.resolution}</p>}</div><span className="console-status">{dispute.status.replace(/_/g, " ")}</span></div>)}</div></section></div>
  </div>;
}
