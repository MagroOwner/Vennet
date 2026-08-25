import { VerifiedBadge } from "@/components/Badges";
import { VerificationForm } from "@/components/forms/VerificationForm";
import { getIdentity, getMyVerificationRequests } from "@/lib/queries";
import { requireSession } from "@/lib/session";
export const dynamic = "force-dynamic";

export default async function VerificationPage() {
  const { userId } = await requireSession("/verification");
  const [identity, requests] = await Promise.all([getIdentity(userId), getMyVerificationRequests(userId)]);
  const hasPending = requests.some((request) => request.status === "pending");
  return <div className="console-page mx-auto max-w-4xl"><div><h1 className="text-3xl font-black">Secure-Pass Portal</h1><p className="mt-1 font-mono text-xs text-zinc-500">IDENTITY VALIDATION // PRIVATE DOCUMENT CHANNEL</p></div>
    <section className="console-panel p-6"><div className="flex items-center justify-between"><div><p className="console-kicker">verification_status</p><p className="mt-3 text-2xl font-black uppercase">{identity?.verificationStatus ?? "IDENTITY REQUIRED"}</p></div>{identity && <VerifiedBadge status={identity.verificationStatus} />}</div>
    {!identity ? <p className="mt-6 text-zinc-400">Create an identity before submitting secure documents.</p> : identity.verificationStatus === "verified" ? <p className="mt-6 text-emerald-400">Secure pass active. Your identity is verified.</p> : hasPending ? <p className="mt-6 text-amber-400">Verification packet is queued for moderator review.</p> : <div className="mt-6 border-t border-zinc-800 pt-6"><VerificationForm /></div>}</section>
    <section className="console-panel"><div className="console-panel-header"><h2 className="font-semibold">Verification Requests</h2><span className="console-kicker">{requests.length} records</span></div><div className="space-y-2 p-3">{requests.length === 0 ? <div className="console-row text-sm text-zinc-500">No requests logged.</div> : requests.map((request) => <div key={request.id} className="console-row"><div><p className="font-mono text-sm font-bold uppercase">{request.documentType.replace(/_/g, " ")}</p><p className="mt-1 text-xs text-zinc-500">{request.createdAt.toLocaleDateString()}{request.reviewNote ? ` · ${request.reviewNote}` : ""}</p></div><span className="console-status">{request.status}</span></div>)}</div></section>
  </div>;
}
