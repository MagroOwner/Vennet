"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { getSellerListings, getSales, getStripeAccount } from "@/lib/services";
import { formatPrice, type Listing, type StripeAccount, type Transaction } from "@/lib/types";

export default function SellerDashboardPage() {
  return (
    <RequireAuth>
      <SellerDashboard />
    </RequireAuth>
  );
}

function SellerDashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [sales, setSales] = useState<Transaction[]>([]);
  const [stripeAccount, setStripeAccount] = useState<StripeAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getSellerListings(user.uid),
      getSales(user.uid),
      getStripeAccount(user.uid),
    ])
      .then(([l, s, a]) => {
        setListings(l);
        setSales(s);
        setStripeAccount(a);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p className="text-center text-zinc-400">Loading…</p>;

  const totalRevenue = sales
    .filter((s) => s.status === "paid" || s.status === "paid_out")
    .reduce((sum, s) => sum + s.amountCents - s.platformFeeCents, 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Seller dashboard</h1>
        <Link
          href="/marketplace/new"
          className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500"
        >
          + New listing
        </Link>
      </div>

      {!stripeAccount?.chargesEnabled && (
        <div className="mt-6 rounded-lg border border-amber-600/40 bg-amber-600/10 p-4">
          <p className="text-amber-300">
            Complete Stripe onboarding to receive payments.
          </p>
          <Link
            href="/stripe/onboarding"
            className="mt-2 inline-block text-sm font-medium text-amber-400 hover:underline"
          >
            Set up payouts →
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">Active listings</p>
          <p className="mt-1 text-3xl font-bold">
            {listings.filter((l) => l.status === "active").length}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">Total sales</p>
          <p className="mt-1 text-3xl font-bold">{sales.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">Net revenue</p>
          <p className="mt-1 text-3xl font-bold text-emerald-400">
            {formatPrice(totalRevenue)}
          </p>
        </div>
      </div>

      <h2 className="mt-10 text-xl font-semibold">Your listings</h2>
      {listings.length === 0 ? (
        <p className="mt-4 text-zinc-400">No listings yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900">
          {listings.map((l) => (
            <li key={l.id} className="flex items-center justify-between px-4 py-3">
              <Link
                href={`/marketplace/${l.id}`}
                className="text-sm text-emerald-400 hover:underline"
              >
                {l.title}
              </Link>
              <div className="flex items-center gap-4 text-sm">
                <span className="capitalize text-zinc-400">{l.status}</span>
                <span className="font-mono">{formatPrice(l.priceCents, l.currency)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-10 text-xl font-semibold">Sales</h2>
      {sales.length === 0 ? (
        <p className="mt-4 text-zinc-400">No sales yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900">
          {sales.map((tx) => (
            <li key={tx.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-zinc-300">
                Listing {tx.listingId.slice(0, 8)}…
              </span>
              <div className="flex items-center gap-4 text-sm">
                <span className="capitalize text-zinc-400">{tx.status}</span>
                <span className="font-mono">
                  {formatPrice(tx.amountCents - tx.platformFeeCents, tx.currency)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
