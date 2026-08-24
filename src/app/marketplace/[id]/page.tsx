import Link from "next/link";
import { notFound } from "next/navigation";
import { ReputationBadge, VerifiedBadge } from "@/components/Badges";
import { BuyButton } from "@/components/forms/BuyButton";
import { auth } from "@/lib/auth";
import { getIdentity, getListing, getReputationScore } from "@/lib/queries";
import { levelForScore } from "@/lib/services/reputation";
import { formatPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ListingPage({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id);
  if (!listing) notFound();

  const [seller, sellerScore, session] = await Promise.all([
    getIdentity(listing.sellerId),
    getReputationScore(listing.sellerId),
    auth(),
  ]);
  const isOwnListing = session?.user?.id === listing.sellerId;

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
            href={`/identity/${seller.userId}`}
            className="mt-6 flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-emerald-600"
          >
            <div>
              <p className="font-medium">{seller.name}</p>
              <div className="mt-1 flex gap-2">
                <VerifiedBadge status={seller.verificationStatus} />
                <ReputationBadge
                  score={seller.reputationScore}
                  level={sellerScore?.level ?? levelForScore(seller.reputationScore)}
                />
              </div>
            </div>
          </Link>
        )}

        <BuyButton
          listingId={listing.id}
          available={listing.status === "active" && !isOwnListing}
          signedIn={Boolean(session?.user?.id)}
        />
      </div>
    </div>
  );
}
