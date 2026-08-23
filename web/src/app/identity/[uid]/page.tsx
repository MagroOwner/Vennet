"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getIdentity, getReputationScore, getSellerListings } from "@/lib/services";
import type { Identity, Listing, ReputationScore } from "@/lib/types";
import { ReputationBadge, VerifiedBadge } from "@/components/Badges";
import { ListingCard } from "@/components/ListingCard";

export default function IdentityPage() {
  const { uid } = useParams<{ uid: string }>();
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [score, setScore] = useState<ReputationScore | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    Promise.all([getIdentity(uid), getReputationScore(uid), getSellerListings(uid)])
      .then(([i, s, l]) => {
        setIdentity(i);
        setScore(s);
        setListings(l.filter((x) => x.status === "active"));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [uid]);

  if (loading) return <p className="text-center text-zinc-400">Loading…</p>;
  if (!identity) return <p className="text-center text-zinc-400">Identity not found.</p>;

  return (
    <div>
      <div className="flex items-start gap-6 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        {identity.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={identity.avatarUrl}
            alt={identity.name}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800 text-2xl font-bold text-emerald-400">
            {identity.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{identity.name}</h1>
            {identity.isPro && (
              <span className="rounded bg-emerald-600 px-2 py-0.5 text-xs font-semibold">
                PRO
              </span>
            )}
            <VerifiedBadge status={identity.verificationStatus} />
            {score && <ReputationBadge score={score.score} level={score.level} />}
          </div>
          <p className="mt-2 max-w-xl text-zinc-400">{identity.bio || "No bio yet."}</p>
        </div>
      </div>

      <h2 className="mt-10 text-xl font-semibold">Active listings</h2>
      {listings.length === 0 ? (
        <p className="mt-4 text-zinc-400">No active listings.</p>
      ) : (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
