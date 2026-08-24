import Link from "next/link";
import { getSales, getSellerListings, getStripeAccount } from "@/lib/queries";
import { requireSession } from "@/lib/session";
import { formatPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SellerDashboardPage() {
  const { userId } = await requireSession("/dashboard/seller");
  const [listings, sales, stripeAccount] = await Promise.all([
    getSellerListings(userId),
    getSales(userId),
    getStripeAccount(userId),
  ]);

  const paidSales = sales.filter((sale) => sale.status === "paid");
  const revenueCents = paidSales.reduce(
    (total, sale) => total + sale.amountCents - sale.platformFeeCents,
    0
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Seller dashboard</h1>
        <Link
          href="/marketplace/new"
          className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500"
        >
          New listing
        </Link>
      </div>

      {!stripeAccount?.chargesEnabled && (
        <div className="mt-6 rounded-lg border border-amber-700 bg-amber-950/40 p-4">
          <p className="text-sm text-amber-300">
            Complete Stripe onboarding before buyers can purchase your listings.
          </p>
          <Link
            href="/stripe/onboarding"
            className="mt-2 inline-block text-sm font-medium text-amber-200 hover:underline"
          >
            Set up payouts →
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">Listings</p>
          <p className="mt-1 text-3xl font-bold">{listings.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">Completed sales</p>
          <p className="mt-1 text-3xl font-bold">{paidSales.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">Net revenue</p>
          <p className="mt-1 text-3xl font-bold text-emerald-400">
            {formatPrice(revenueCents)}
          </p>
        </div>
      </div>

      <h2 className="mt-8 text-xl font-semibold">Your listings</h2>
      {listings.length === 0 ? (
        <p className="mt-4 text-zinc-400">No listings yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-800 rounded-lg border border-zinc-800">
          {listings.map((listing) => (
            <li key={listing.id} className="flex items-center justify-between px-4 py-3">
              <Link
                href={`/marketplace/${listing.id}`}
                className="text-sm font-medium hover:text-emerald-400"
              >
                {listing.title}
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-sm text-emerald-400">
                  {formatPrice(listing.priceCents, listing.currency)}
                </span>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs capitalize text-zinc-300">
                  {listing.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 text-xl font-semibold">Sales</h2>
      {sales.length === 0 ? (
        <p className="mt-4 text-zinc-400">No sales yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-800 rounded-lg border border-zinc-800">
          {sales.map((sale) => (
            <li key={sale.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">
                  {formatPrice(sale.amountCents, sale.currency)}
                </p>
                <p className="text-xs text-zinc-500">
                  fee {formatPrice(sale.platformFeeCents, sale.currency)} ·{" "}
                  {sale.createdAt.toLocaleDateString()}
                </p>
              </div>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs capitalize text-zinc-300">
                {sale.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
