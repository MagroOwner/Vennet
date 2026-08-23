"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getListing, getIdentity } from "@/lib/services";
import { purchaseListing } from "@/lib/callables";
import { formatPrice, type Identity, type Listing } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import { ReputationBadge, VerifiedBadge } from "@/components/Badges";

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<Identity | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getListing(id)
      .then(async (l) => {
        setListing(l);
        if (l) setSeller(await getIdentity(l.sellerId));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function buy() {
    if (!user) {
      router.push("/login");
      return;
    }
    setBuying(true);
    setError(null);
    try {
      const res = await purchaseListing({ listingId: id });
      router.push(`/dashboard?purchased=${res.transactionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed");
    } finally {
      setBuying(false);
    }
  }

  if (loading) return <p className="text-center text-zinc-400">Loading…</p>;
  if (!listing) return <p className="text-center text-zinc-400">Listing not found.</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
        {listing.imageUrls[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.imageUrls[0]}
            alt={listing.title}
            className="w-full object-cover"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center text-zinc-600">
            No image
          </div>
        )}
        {listing.imageUrls.length > 1 && (
          <div className="flex gap-2 p-2">
            {listing.imageUrls.slice(1).map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="h-16 w-16 rounded object-cover" />
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold">{listing.title}</h1>
        <p className="mt-2 text-2xl font-semibold text-emerald-400">
          {formatPrice(listing.priceCents, listing.currency)}
        </p>
        <span className="mt-2 inline-block rounded bg-zinc-800 px-2 py-0.5 text-xs capitalize text-zinc-400">
          {listing.category}
        </span>
        <p className="mt-4 whitespace-pre-wrap text-zinc-300">{listing.description}</p>

        {seller && (
          <Link
            href={`/identity/${seller.uid}`}
            className="mt-6 flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-emerald-600"
          >
            <div>
              <p className="font-medium">{seller.name}</p>
              <div className="mt-1 flex gap-2">
                <VerifiedBadge status={seller.verificationStatus} />
                <ReputationBadge
                  score={seller.reputationScore}
                  level={
                    seller.reputationScore >= 750
                      ? "platinum"
                      : seller.reputationScore >= 500
                        ? "gold"
                        : seller.reputationScore >= 300
                          ? "silver"
                          : seller.reputationScore >= 150
                            ? "bronze"
                            : "new"
                  }
                />
              </div>
            </div>
          </Link>
        )}

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        <button
          onClick={buy}
          disabled={buying || listing.status !== "active"}
          className="mt-6 w-full rounded-lg bg-emerald-600 py-3 font-medium hover:bg-emerald-500 disabled:opacity-50"
        >
          {listing.status !== "active"
            ? "Not available"
            : buying
              ? "Processing…"
              : "Buy now"}
        </button>
      </div>
    </div>
  );
}
