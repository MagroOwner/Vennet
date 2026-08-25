import Link from "next/link";
import { getSales, getSellerListings, getStripeAccount } from "@/lib/queries";
import { requireSession } from "@/lib/session";
import { formatPrice } from "@/lib/types";
export const dynamic = "force-dynamic";

export default async function SellerDashboardPage() {
  const { userId } = await requireSession("/dashboard/seller");
  const [listings, sales, stripeAccount] = await Promise.all([getSellerListings(userId), getSales(userId), getStripeAccount(userId)]);
  const paidSales = sales.filter((sale) => sale.status === "paid");
  const revenueCents = paidSales.reduce((total, sale) => total + sale.amountCents - sale.platformFeeCents, 0);
  return <div className="console-page"><div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-black">Swift Merchant Console</h1><p className="mt-1 font-mono text-xs text-zinc-500">SELLER OPERATIONS // ESCROW-READY INVENTORY</p></div><Link href="/marketplace/new" className="rounded border border-emerald-700 bg-emerald-950/30 px-4 py-2 font-mono text-xs font-bold text-emerald-400">REGISTER_ASSET +</Link></div>
  {!stripeAccount?.chargesEnabled && <div className="rounded-lg border border-amber-800 bg-amber-950/20 p-4 text-sm text-amber-300">PAYOUT CHANNEL OFFLINE. <Link href="/stripe/onboarding" className="font-bold underline">INITIALIZE STRIPE ONBOARDING →</Link></div>}
  <div className="grid gap-4 md:grid-cols-3">{[["active_listings", listings.length],["completed_sales", paidSales.length],["net_revenue", formatPrice(revenueCents)]].map(([label,value]) => <section key={label} className="console-panel p-5"><p className="console-kicker">{label}</p><p className="mt-5 font-mono text-3xl font-black text-emerald-400">{value}</p></section>)}</div>
  <div className="grid gap-5 xl:grid-cols-2"><section className="console-panel"><div className="console-panel-header"><h2 className="font-semibold">Registered Assets</h2><span className="console-kicker">{listings.length} total</span></div><div className="space-y-2 p-3">{listings.length === 0 ? <div className="console-row text-zinc-500">No registered assets.</div> : listings.map((listing) => <Link key={listing.id} href={`/marketplace/${listing.id}`} className="console-row"><div><p className="font-mono text-sm font-bold">{listing.title}</p><p className="mt-1 text-xs text-emerald-400">{formatPrice(listing.priceCents, listing.currency)}</p></div><span className="console-status">{listing.status}</span></Link>)}</div></section>
  <section className="console-panel"><div className="console-panel-header"><h2 className="font-semibold">Sales Ledger</h2><span className="console-kicker">{sales.length} records</span></div><div className="space-y-2 p-3">{sales.length === 0 ? <div className="console-row text-zinc-500">No sales events recorded.</div> : sales.map((sale) => <div key={sale.id} className="console-row"><div><p className="font-mono text-sm font-bold">{formatPrice(sale.amountCents, sale.currency)}</p><p className="mt-1 text-xs text-zinc-500">FEE {formatPrice(sale.platformFeeCents, sale.currency)} · {sale.createdAt.toLocaleDateString()}</p></div><span className="console-status">{sale.status}</span></div>)}</div></section></div></div>;
}
