import Link from "next/link";
import { formatPrice, type Listing } from "@/lib/types";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/marketplace/${listing.id}`}
      className="group overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 transition hover:border-emerald-600"
    >
      <div className="aspect-video bg-zinc-800">
        {listing.imageUrls[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.imageUrls[0]}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-600">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-zinc-100 group-hover:text-emerald-400">
            {listing.title}
          </h3>
          <span className="whitespace-nowrap font-semibold text-emerald-400">
            {formatPrice(listing.priceCents, listing.currency)}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{listing.description}</p>
        <span className="mt-2 inline-block rounded bg-zinc-800 px-2 py-0.5 text-xs capitalize text-zinc-400">
          {listing.category}
        </span>
      </div>
    </Link>
  );
}
