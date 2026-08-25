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

  return <div className="console-page">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-emerald-300">Seller tools</p><h1 className="mt-1 text-3xl font-black">Your seller dashboard</h1><p className="mt-2 text-slate-700">Create digital listings, review sales, and receive payouts through Stripe.</p></div><Link href="/marketplace/new" className="button-primary">Create a listing</Link></div>
    {!stripeAccount?.chargesEnabled && <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-100 via-yellow-50 to-white p-5 shadow-sm"><div><p className="font-bold text-slate-950">Connect Stripe to receive payouts</p><p className="mt-1 text-sm leading-5 text-slate-700">Complete Stripe onboarding before accepting sales. Vennet keeps a 5% platform fee from each sale.</p></div><Link href="/stripe/onboarding" className="inline-flex items-center justify-center rounded-xl border border-amber-400 bg-amber-100 px-5 py-3 font-bold text-slate-950 transition hover:bg-amber-200">Connect Stripe</Link></div>}
    <div className="grid gap-4 md:grid-cols-3">
      {[["Active listings", listings.length, "Digital products and services currently for sale."], ["Completed sales", paidSales.length, "Orders paid successfully by customers."], ["Your earnings", formatPrice(revenueCents), "Sales revenue after Vennet's platform fee."]].map(([label, value, description]) => <section key={label} className="console-panel p-5"><p className="text-sm font-semibold text-slate-200">{label}</p><p className="mt-3 text-3xl font-black text-emerald-300">{value}</p><p className="mt-2 text-sm leading-5 text-slate-400">{description}</p></section>)}
    </div>
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="console-panel"><div className="console-panel-header"><div><h2 className="font-semibold">Your listings</h2><p className="mt-1 text-sm text-slate-400">Products and services you have created.</p></div><span className="text-sm text-slate-400">{listings.length} total</span></div><div className="space-y-2 p-3">{listings.length === 0 ? <div className="console-row text-slate-400">You have no listings yet. Create your first digital product or service to start selling.</div> : listings.map((listing) => <div key={listing.id} className="console-row flex-wrap gap-3"><Link href={"/marketplace/" + listing.id} className="min-w-0 flex-1"><p className="truncate font-semibold text-white">{listing.title}</p><p className="mt-1 text-sm text-slate-300">{formatPrice(listing.priceCents, listing.currency)} · <span className="capitalize">{listing.category === "other" ? "subscription" : listing.category}</span></p></Link><div className="flex items-center gap-3"><span className="console-status">{listing.status}</span><Link href={"/marketplace/" + listing.id + "/edit"} className="rounded-lg border border-emerald-400/40 px-3 py-1.5 text-sm font-bold text-emerald-200 transition hover:bg-emerald-400/10">Edit</Link></div></div>)}</div></section>
      <section className="console-panel"><div className="console-panel-header"><div><h2 className="font-semibold">Recent sales</h2><p className="mt-1 text-sm text-slate-400">Payments from your customers.</p></div><span className="text-sm text-slate-400">{sales.length} total</span></div><div className="space-y-2 p-3">{sales.length === 0 ? <div className="console-row text-slate-400">Your completed sales will appear here.</div> : sales.map((sale) => <div key={sale.id} className="console-row"><div><p className="font-semibold text-white">{formatPrice(sale.amountCents, sale.currency)}</p><p className="mt-1 text-sm text-slate-400">Vennet fee: {formatPrice(sale.platformFeeCents, sale.currency)} · {sale.createdAt.toLocaleDateString()}</p></div><span className="console-status">{sale.status}</span></div>)}</div></section>
    </div>
  </div>;
}
