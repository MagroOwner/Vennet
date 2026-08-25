import { AdminPanels } from "@/components/admin/AdminPanels";
import { getFraudSignals, getOpenDisputes, getPendingVerificationRequests } from "@/lib/queries";
import { requireStaffSession } from "@/lib/session";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { role } = await requireStaffSession("/admin");
  const [disputes, verificationRequests, fraudSignals] = await Promise.all([getOpenDisputes(), getPendingVerificationRequests(), getFraudSignals()]);
  return <div className="console-page"><div className="flex items-end justify-between"><div><h1 className="text-3xl font-black">Command Center</h1><p className="mt-1 font-mono text-xs text-zinc-500">STAFF CLEARANCE: {role.toUpperCase()} // MODERATION SYSTEMS ONLINE</p></div><span className="console-status">secure channel</span></div>
    <div className="grid gap-4 md:grid-cols-3">{[["open_disputes", disputes.length],["verification_queue", verificationRequests.length],["fraud_signals", fraudSignals.length]].map(([label,value]) => <section key={label} className="console-panel p-5"><p className="console-kicker">{label}</p><p className="mt-4 font-mono text-3xl font-black text-emerald-400">{value}</p></section>)}</div>
    <section className="console-panel p-5"><p className="console-kicker">moderator_workspace</p><AdminPanels isAdmin={role === "admin"} disputes={disputes.map((dispute) => ({ id: dispute.id, reason: dispute.reason, status: dispute.status, buyerId: dispute.buyerId, sellerId: dispute.sellerId, createdAt: dispute.createdAt.toISOString() }))} verificationRequests={verificationRequests.map((request) => ({ id: request.id, userId: request.userId, fullName: request.fullName, documentType: request.documentType, documentPaths: request.documentPaths, createdAt: request.createdAt.toISOString() }))} fraudSignals={fraudSignals.map((signal) => ({ id: signal.id, userId: signal.userId, type: signal.type, severity: signal.severity, details: signal.details, createdAt: signal.createdAt.toISOString() }))} /></section>
  </div>;
}
