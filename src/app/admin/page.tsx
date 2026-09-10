import Link from "next/link";
import { AdminPanels } from "@/components/admin/AdminPanels";
import { getAdminOverview, getFraudSignals, getOpenDisputes, getPendingVerificationRequests } from "@/lib/queries";
import { requireStaffSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default async function AdminPage() {
  const { role } = await requireStaffSession("/admin");
  const [overview, disputes, verificationRequests, fraudSignals] = await Promise.all([
    getAdminOverview(),
    getOpenDisputes(),
    getPendingVerificationRequests(),
    getFraudSignals(),
  ]);

  const cards = [
    ["Active members", overview.memberCount.toLocaleString(), overview.proMemberCount + " Pro members"],
    ["Live offers", overview.activeListingCount.toLocaleString(), overview.draftListingCount + " drafts waiting"],
    ["Completed orders", overview.completedOrderCount.toLocaleString(), money.format(overview.grossVolumeCents / 100) + " processed"],
    ["Payout-ready sellers", overview.payoutReadySellerCount.toLocaleString(), overview.verifiedMemberCount + " verified members"],
  ];

  return <main className="space-y-7 pb-12">
    <section className="relative overflow-hidden rounded-[2rem] bg-[#10151f] px-7 py-9 text-white shadow-[0_22px_55px_rgb(16_21_31/.18)] sm:px-10">
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="relative flex flex-wrap items-end justify-between gap-6">
        <div><p className="eyebrow text-emerald-200">Vennet command center</p><h1 className="mt-2 text-4xl font-black tracking-[-.05em]">Marketplace overview</h1><p className="mt-3 max-w-2xl leading-7 text-slate-300">Monitor growth, review safety queues, and keep the marketplace moving.</p></div>
        <div className="flex gap-3"><Link href="/marketplace" className="button-secondary border-white/20 bg-white/[.06] text-white hover:bg-white/[.12]">View marketplace</Link><Link href="/dashboard/seller" className="button-primary">Seller dashboard</Link></div>
      </div>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, detail], index) => <article key={label} className={"rounded-[1.4rem] border p-5 shadow-sm " + (index === 0 ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white")}><p className="text-sm font-bold text-slate-600">{label}</p><p className="mt-3 text-3xl font-black tracking-[-.04em] text-[#10151f]">{value}</p><p className="mt-2 text-sm text-slate-500">{detail}</p></article>)}</section>

    <section className="grid gap-4 lg:grid-cols-3">
      {[["Needs review", disputes.length + verificationRequests.length, "Disputes and verification submissions"], ["Safety signals", fraudSignals.length, "Potential marketplace risks to review"], ["Your clearance", role === "admin" ? "Administrator" : "Moderator", role === "admin" ? "Full moderation and reputation access" : "Moderation access only"]].map(([label, value, detail]) => <article key={label} className="surface-card p-5"><p className="eyebrow">{label}</p><p className="mt-3 text-2xl font-black text-[#10151f]">{value}</p><p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p></article>)}
    </section>

    <section className="surface-card overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-5"><p className="eyebrow">Moderation workspace</p><h2 className="mt-2 text-2xl font-black tracking-[-.04em] text-[#10151f]">Review marketplace activity</h2><p className="mt-2 text-sm text-slate-600">Open each tab to resolve disputes, review verification requests, investigate signals, or adjust reputation.</p></div>
      <div className="px-6 pb-6"><AdminPanels isAdmin={role === "admin"} disputes={disputes.map((dispute) => ({ id: dispute.id, reason: dispute.reason, status: dispute.status, buyerId: dispute.buyerId, sellerId: dispute.sellerId, createdAt: dispute.createdAt.toISOString() }))} verificationRequests={verificationRequests.map((request) => ({ id: request.id, userId: request.userId, fullName: request.fullName, documentType: request.documentType, documentPaths: request.documentPaths, createdAt: request.createdAt.toISOString() }))} fraudSignals={fraudSignals.map((signal) => ({ id: signal.id, userId: signal.userId, type: signal.type, severity: signal.severity, details: signal.details, createdAt: signal.createdAt.toISOString() }))} /></div>
    </section>
  </main>;
}
