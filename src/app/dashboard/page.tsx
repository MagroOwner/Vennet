import Link from "next/link";
import { IdentityForm } from "@/components/forms/IdentityForm";
import { getIdentity, getPurchases, getReputationScore } from "@/lib/queries";
import { requireSession } from "@/lib/session";
import { formatPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

function SummaryCard({ label, value, description, href, action, accent = false }: { label: string; value: string | number; description: string; href: string; action: string; accent?: boolean }) {
  return <section className={accent ? "console-panel border-emerald-500/30 p-5" : "console-panel p-5"}>
    <p className="text-sm font-semibold text-slate-200">{label}</p>
    <p className={accent ? "mt-3 text-3xl font-black text-emerald-300" : "mt-3 text-3xl font-black text-white"}>{value}</p>
    <p className="mt-2 min-h-10 text-sm leading-5 text-slate-400">{description}</p>
    <Link href={href} className="console-link mt-4 flex items-center justify-between">{action}<span aria-hidden="true">→</span></Link>
  </section>;
}

export default async function DashboardPage() {
  const { userId, email } = await requireSession("/dashboard");
  const identity = await getIdentity(userId);
  if (!identity) return <div className="console-page mx-auto max-w-xl"><div><h1 className="text-3xl font-black">Set up your profile</h1><p className="mt-2 text-slate-400">Add a display name to start buying, selling, and managing your account.</p></div><div className="console-panel p-6"><IdentityForm mode="create" defaultName={email.split("@")[0] ?? ""} /></div></div>;

  const [score, purchases] = await Promise.all([getReputationScore(userId), getPurchases(userId)]);
  const reputation = score?.score ?? identity.reputationScore;
  const verification = identity.verificationStatus === "verified" ? "Verified" : "Not verified";
  const accountLevel = identity.isPro ? "Vennet Pro" : "Free plan";

  return <div className="console-page">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-emerald-300">Welcome back, {identity.name}</p><h1 className="mt-1 text-3xl font-black">Your dashboard</h1><p className="mt-2 text-slate-400">Manage your purchases, seller tools, and account in one place.</p></div><Link href="/marketplace/new" className="button-primary">Create a listing</Link></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard label="Profile" value={identity.name} description="Update your public name and account details." href="/settings" action="Edit profile" />
      <SummaryCard label="Reputation" value={reputation + "%"} description="Your standing is built from completed activity." href="/reputation" action="View reputation" accent />
      <SummaryCard label="Identity verification" value={verification} description="Verify your identity to unlock more platform features." href="/verification" action={verification === "Verified" ? "View verification" : "Verify identity"} />
      <SummaryCard label="Membership" value={accountLevel} description="Get more tools and benefits with Vennet Pro." href="/pro" action={identity.isPro ? "Manage membership" : "Explore Pro"} />
    </div>
    <div className="grid gap-5 xl:grid-cols-[1.65fr_0.75fr]">
      <section className="console-panel"><div className="console-panel-header"><div><h2 className="font-semibold">Recent purchases</h2><p className="mt-1 text-sm text-slate-400">Your latest marketplace orders.</p></div><span className="text-sm text-slate-400">{purchases.length} total</span></div><div className="space-y-2 p-3">
        {purchases.length === 0 ? <div className="console-row text-sm text-slate-400">You have not made a purchase yet. Explore the marketplace to find digital products and services.</div> : purchases.slice(0, 6).map((transaction) => <Link key={transaction.id} href={"/marketplace/" + transaction.listingId} className="console-row group"><div><p className="font-semibold text-white group-hover:text-emerald-300">Marketplace purchase</p><p className="mt-1 text-sm text-slate-400">{transaction.createdAt.toLocaleDateString()} · {formatPrice(transaction.amountCents, transaction.currency)}</p></div><span className="console-status">{transaction.status}</span></Link>)}
      </div></section>
      <section className="console-panel"><div className="console-panel-header"><div><h2 className="font-semibold">Quick links</h2><p className="mt-1 text-sm text-slate-400">Common account actions.</p></div></div><div className="space-y-2 p-3">
        {[["Explore marketplace", "Find digital products, services, and subscriptions.", "/marketplace"], ["Seller dashboard", "Create listings and track your sales.", "/dashboard/seller"], ["Get help with an order", "Open or review a purchase dispute.", "/disputes"], ["Verify your identity", "Secure your account with Stripe Identity.", "/verification"]].map(([title, description, href]) => <Link key={title} href={href} className="block rounded-xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-emerald-400/30 hover:bg-white/[0.06]"><p className="font-semibold text-white">{title}</p><p className="mt-1 text-sm leading-5 text-slate-400">{description}</p></Link>)}
      </div></section>
    </div>
  </div>;
}
