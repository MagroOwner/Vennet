import Link from "next/link";
import { formatPrice, type Listing } from "@/lib/types";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/marketplace/${listing.id}`} className="group overflow-hidden rounded-lg border border-zinc-800 bg-[#0a0c0f] transition hover:border-emerald-700">
      <div className="aspect-video border-b border-zinc-800 bg-zinc-900">
        {listing.imageUrls[0] ? (
          // The source is user-provided and can be an arbitrary Vercel Blob URL.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.imageUrls[0]} alt={listing.title} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center font-mono text-xs text-zinc-600">NO_ASSET_PREVIEW</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-mono text-sm font-bold text-zinc-100 group-hover:text-emerald-400">{listing.title}</h3>
          <span className="whitespace-nowrap font-mono text-sm font-bold text-emerald-400">{formatPrice(listing.priceCents, listing.currency)}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{listing.description}</p>
        <span className="mt-3 inline-block rounded border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-[10px] uppercase text-zinc-400">{listing.category}</span>
      </div>
    </Link>
  );
}
