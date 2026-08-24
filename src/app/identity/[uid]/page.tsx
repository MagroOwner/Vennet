import { notFound } from "next/navigation";
import { ReputationBadge, VerifiedBadge } from "@/components/Badges";
import { ListingCard } from "@/components/ListingCard";
import { getIdentity, getReputationScore, getSellerListings } from "@/lib/queries";
import { levelForScore } from "@/lib/services/reputation";

export const dynamic = "force-dynamic";

export default async function IdentityPage({ params }: { params: { uid: string } }) {
  const identity = await getIdentity(params.uid);
  if (!identity) notFound();

  const [score, listings] = await Promise.all([
    getReputationScore(identity.userId),
    getSellerListings(identity.userId),
  ]);
  const activeListings = listings.filter((listing) => listing.status === "active");

  return (
    <div>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center gap-4">
          {identity.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={identity.avatarUrl}
              alt={identity.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{identity.name}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <VerifiedBadge status={identity.verificationStatus} />
              <ReputationBadge
                score={identity.reputationScore}
                level={score?.level ?? levelForScore(identity.reputationScore)}
              />
              {identity.isPro && (
                <span className="rounded-full bg-emerald-600/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                  Vennet Pro
                </span>
              )}
            </div>
          </div>
        </div>
        {identity.bio && <p className="mt-4 text-zinc-300">{identity.bio}</p>}
        <p className="mt-4 text-sm text-zinc-500">
          {score?.totalEvents ?? 0} reputation events · member since{" "}
          {identity.createdAt.toLocaleDateString()}
        </p>
      </div>

      <h2 className="mt-8 text-xl font-semibold">Active listings</h2>
      {activeListings.length === 0 ? (
        <p className="mt-4 text-zinc-400">No active listings.</p>
      ) : (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activeListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
