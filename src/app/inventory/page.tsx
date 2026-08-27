import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { PurchaseSupportComposer } from "@/components/PurchaseSupportComposer";
import { requireSession } from "@/lib/session";
import { db } from "@/lib/db";
import { listings, transactions } from "@/lib/db/schema";
import { getPurchaseMessages } from "@/lib/queries";
import { formatPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const { userId } = await requireSession("/inventory");
  const purchases = await db.select({ transaction: transactions, listing: listings }).from(transactions).innerJoin(listings, eq(transactions.listingId, listings.id)).where(and(eq(transactions.buyerId, userId), eq(transactions.status, "paid"))).orderBy(desc(transactions.createdAt));
  const messageGroups = await Promise.all(purchases.map(({ transaction }) => getPurchaseMessages(transaction.id)));

  return <main className="mx-auto max-w-5xl space-y-7 pb-12">
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-7 py-8 text-white shadow-2xl shadow-emerald-950/20 sm:px-10"><div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_0%,rgba(52,211,153,.24),transparent_35%)]" /><div className="relative flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-300">Your Vennet library</p><h1 className="mt-2 text-4xl font-black tracking-tight">Everything you own, ready when you are.</h1><p className="mt-3 max-w-2xl text-slate-300">Downloads, access instructions, licenses, and help from the seller—organized by purchase.</p></div><Link href="/marketplace" className="rounded-xl bg-emerald-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-200">Explore offers →</Link></div></section>

    {purchases.length === 0 ? <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-lg shadow-slate-900/5"><p className="text-xl font-black text-slate-950">Your library is ready for its first find.</p><p className="mx-auto mt-3 max-w-md text-slate-600">After checkout, every digital delivery and subscription detail will be saved here.</p><Link href="/marketplace" className="mt-6 inline-block rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white">Browse the marketplace</Link></section> : <div className="space-y-6">{purchases.map(({ transaction, listing }, index) => {
      const messages = messageGroups[index];
      const automationAccessUrl = listing.collection === "bots-automations"
        ? listing.deliveryInstructions.match(/Automation access link:\s*(https?:\/\/\S+)/i)?.[1]
        : undefined;
      return <article key={transaction.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5"><div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-6 py-5"><div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700">Purchased {transaction.createdAt.toLocaleDateString()}</p><h2 className="mt-1 text-2xl font-black text-slate-950">{listing.title}</h2><p className="mt-2 text-sm text-slate-600">{formatPrice(transaction.amountCents, transaction.currency)} · <span className="capitalize">{listing.category === "digital" ? "Digital product" : listing.category === "services" ? "Creative service" : "Membership"}</span></p></div><div className="flex gap-2"><Link href={"/marketplace/" + listing.id} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 hover:border-emerald-400">View offer</Link><Link href={"/marketplace/" + listing.id} className="rounded-xl bg-emerald-300 px-4 py-2 text-sm font-black text-slate-950">Buy again</Link></div></div>
      <div className="grid gap-7 p-6 lg:grid-cols-[1.15fr_.85fr]"><div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700">Access your purchase</p><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{listing.deliveryInstructions || "The seller will provide access instructions here."}</p>{automationAccessUrl && <a href={automationAccessUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-black text-slate-950 transition hover:bg-emerald-200">Open bot or automation →</a>}{listing.deliveryFilePaths.length > 0 && <div className="mt-6"><p className="font-black text-slate-950">Downloads</p><div className="mt-3 flex flex-wrap gap-2">{listing.deliveryFilePaths.map((pathname, fileIndex) => <a key={pathname} href={"/api/inventory/download?pathname=" + encodeURIComponent(pathname)} className="rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-black text-slate-950 transition hover:bg-emerald-200">Download file {fileIndex + 1} ↓</a>)}</div></div>}</div>
      <aside className="rounded-2xl bg-slate-50 p-5"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700">Purchase support</p><p className="mt-2 text-sm leading-6 text-slate-600">For delivery, access, and license questions, message the seller directly here.</p>{messages.length > 0 && <div className="mt-4 max-h-48 space-y-2 overflow-y-auto">{messages.map((message) => <p key={message.id} className="rounded-xl bg-white p-3 text-sm leading-6 text-slate-700">{message.body}</p>)}</div>}<PurchaseSupportComposer transactionId={transaction.id} /><Link href={"/disputes?transactionId=" + transaction.id} className="mt-4 inline-block text-sm font-bold text-slate-700 hover:text-emerald-700">Need formal order help? →</Link></aside></div></article>;
    })}</div>}
  </main>;
}
