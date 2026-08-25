import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { requireSession } from "@/lib/session";
import { db } from "@/lib/db";
import { listings, transactions } from "@/lib/db/schema";
import { formatPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const { userId } = await requireSession("/inventory");
  const purchases = await db
    .select({ transaction: transactions, listing: listings })
    .from(transactions)
    .innerJoin(listings, eq(transactions.listingId, listings.id))
    .where(and(eq(transactions.buyerId, userId), eq(transactions.status, "paid")))
    .orderBy(desc(transactions.createdAt));

  return (
    <div className="console-page mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-sm font-semibold text-emerald-300">Your purchases</p><h1 className="mt-1 text-3xl font-black">Inventory</h1><p className="mt-2 text-slate-400">Everything you have purchased on Vennet, including downloads and access details.</p></div>
        <Link href="/marketplace" className="button-primary">Explore marketplace</Link>
      </div>

      {purchases.length === 0 ? (
        <section className="console-panel p-8 text-center"><h2 className="text-xl font-bold">Your inventory is empty</h2><p className="mx-auto mt-3 max-w-md text-slate-400">After a payment is confirmed, your digital files, subscription instructions, and seller support details will appear here.</p><Link href="/marketplace" className="button-primary mt-6">Browse digital products</Link></section>
      ) : (
        <div className="space-y-5">
          {purchases.map(({ transaction, listing }) => (
            <section key={transaction.id} className="console-panel overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 p-6"><div><p className="text-sm font-semibold text-emerald-300">Purchased {transaction.createdAt.toLocaleDateString()}</p><h2 className="mt-1 text-2xl font-bold text-white">{listing.title}</h2><p className="mt-2 text-sm text-slate-400">{formatPrice(transaction.amountCents, transaction.currency)} · {listing.category === "digital" ? "Digital product" : listing.category === "services" ? "Service" : "Subscription or membership"}</p></div><Link href={"/marketplace/" + listing.id} className="button-secondary px-4 py-2 text-sm">View listing</Link></div>
              <div className="grid gap-5 p-6 md:grid-cols-[1.15fr_0.85fr]">
                <div><h3 className="font-semibold text-white">How to access your purchase</h3><p className="mt-3 whitespace-pre-wrap leading-7 text-slate-300">{listing.deliveryInstructions}</p>{listing.deliveryFilePaths.length > 0 && <div className="mt-6"><h3 className="font-semibold text-white">Your downloads</h3><div className="mt-3 flex flex-wrap gap-2">{listing.deliveryFilePaths.map((pathname, index) => <a key={pathname} href={"/api/inventory/download?pathname=" + encodeURIComponent(pathname)} className="button-primary px-4 py-2 text-sm">Download file {index + 1} ↓</a>)}</div></div>}</div>
                <aside className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5"><p className="text-sm font-semibold text-emerald-200">Need help?</p><p className="mt-2 text-sm leading-6 text-slate-300">Contact this seller about access, delivery, or license questions.</p><p className="mt-4 break-words rounded-lg bg-black/20 p-3 text-sm font-medium text-white">{listing.supportContact}</p><Link href={"/disputes?transactionId=" + transaction.id} className="console-link mt-5 inline-block">Get order help →</Link></aside>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
