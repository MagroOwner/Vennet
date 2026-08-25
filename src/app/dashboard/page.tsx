import Link from "next/link";
import { IdentityForm } from "@/components/forms/IdentityForm";
import { getIdentity, getPurchases, getReputationScore } from "@/lib/queries";
import { requireSession } from "@/lib/session";
import { formatPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

function StatusCard({ label, value, meta, href, action, accent = false }: { label: string; value: string | number; meta: string; href: string; action: string; accent?: boolean }) {
  return <section className={`console-panel p-5 ${accent ? "border-emerald-800" : ""}`}>
    <div className="flex justify-between"><p className="console-kicker">{label}</p><p className="console-kicker">{meta}</p></div>
    <p className={`mt-5 text-3xl font-black uppercase ${accent ? "text-emerald-400" : ""}`}>{value}</p>
    <Link href={href} className="console-link mt-5 flex items-center justify-between">{action}<span>→</span></Link>
  </section>;
}

export default async function DashboardPage() {
  const { userId, email } = await requireSession("/dashboard");
  const identity = await getIdentity(userId);
  if (!identity) return <div className="console-page mx-auto max-w-xl"><div><h1 className="text-3xl font-black">Initialize identity</h1><p className="mt-1 font-mono text-xs text-zinc-500">SYSTEM ACCESS REQUIRES A VERIFIED PROFILE</p></div><div className="console-panel p-6"><IdentityForm mode="create" defaultName={email.split("@")[0] ?? ""} /></div></div>;

  const [score, purchases] = await Promise.all([getReputationScore(userId), getPurchases(userId)]);
  const reputation = score?.score ?? identity.reputationScore;
  const verification = identity.verificationStatus === "verified" ? "VERIFIED" : identity.verificationStatus.toUpperCase();

  return <div className="console-page">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-black">Operator Dashboard</h1><p className="mt-1 font-mono text-xs text-zinc-500">SYSTEM NODE: VNET-9901-SECURE // PROTOCOL STATUS: OPERATIONAL</p></div><p className="font-mono text-[10px] text-zinc-500">SYNCED NOW <span className="text-emerald-400">↻</span></p></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatusCard label="system_id" value={identity.name} meta="identity_node" href="/settings" action="edit_identity" />
      <StatusCard label="reputation_index" value={`${reputation}%`} meta="stable_90_days" href="/reputation" action="view_ledger_hist" accent />
      <StatusCard label="secure_pass" value={verification} meta="kyc_tier_3" href="/verification" action="verify_sec_portal" />
      <StatusCard label="account_level" value={identity.isPro ? "PRO" : "STANDARD"} meta="resource_access" href="/pro" action="upgrade_resources" />
    </div>
    <div className="grid gap-5 xl:grid-cols-[1.65fr_0.75fr]">
      <section className="console-panel"><div className="console-panel-header"><h2 className="font-semibold"><span className="mr-2 text-emerald-400">▣</span>Transaction Inventory</h2><span className="console-kicker">{purchases.length} records</span></div><div className="space-y-2 p-3">
        {purchases.length === 0 ? <div className="console-row text-sm text-zinc-500">No transaction records registered.</div> : purchases.slice(0, 6).map((transaction) => <Link key={transaction.id} href={`/marketplace/${transaction.listingId}`} className="console-row group"><div><p className="font-mono text-sm font-bold text-zinc-100 group-hover:text-emerald-400">TX-{transaction.id.slice(0, 8).toUpperCase()}</p><p className="mt-1 text-xs text-zinc-500">{transaction.createdAt.toLocaleDateString()} · {formatPrice(transaction.amountCents, transaction.currency)}</p></div><span className="console-status">{transaction.status}</span></Link>)}
      </div></section>
      <section className="console-panel"><div className="console-panel-header"><h2 className="font-semibold"><span className="mr-2 text-emerald-400">▤</span>Micro-Services</h2></div><div className="space-y-3 p-4">
        {[["Marketplace Engine","Browse protected listings and checkout flows.","/marketplace"],["Dispute Arbitration","Open and track transaction resolutions.","/disputes"],["Identity Verification","Manage identity proof and access level.","/verification"]].map(([title, body, href]) => <div key={title} className="rounded-xl border border-zinc-800 p-4"><p className="console-kicker text-emerald-400">active // tier_3</p><h3 className="mt-6 font-bold">{title}</h3><p className="mt-2 text-sm leading-5 text-zinc-400">{body}</p><Link href={href} className="mt-4 block rounded-md bg-zinc-800 px-3 py-2 text-center font-mono text-xs font-bold hover:bg-zinc-700">EXEC_SERVICE ↗</Link></div>)}
      </div></section>
    </div>
  </div>;
}
