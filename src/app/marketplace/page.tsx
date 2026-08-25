import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { getActiveListings } from "@/lib/queries";
import { LISTING_CATEGORIES, type ListingCategory } from "@/lib/types";

export const dynamic = "force-dynamic";
function parseCategory(value: string | undefined): ListingCategory | undefined { return LISTING_CATEGORIES.find((category) => category === value); }

export default async function MarketplacePage({ searchParams }: { searchParams: { category?: string } }) {
  const category = parseCategory(searchParams.category);
  const listings = await getActiveListings(category);
  return (
    <div className="console-page">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">Digital marketplace</p><h1 className="mt-2 text-3xl font-black">Find your next digital advantage.</h1><p className="mt-2 text-zinc-400">Explore digital products, services, and creator memberships. Every purchase stays on-platform.</p></div>
        <div className="flex items-center gap-3"><CategoryFilter value={category ?? ""} /><Link href="/dashboard/seller" className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950">Start selling</Link></div>
      </div>
      <section className="console-panel"><div className="console-panel-header"><h2 className="font-semibold">Explore offers</h2><span className="text-sm text-zinc-500">{listings.length} available</span></div>
        {listings.length === 0 ? <div className="p-10 text-center"><p className="font-semibold">Nothing here yet.</p><p className="mt-2 text-sm text-zinc-500">Be the first to list a digital product or service.</p><Link href="/dashboard/seller" className="console-link mt-4 inline-block">Start selling →</Link></div> : <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">{listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>}
      </section>
    </div>
  );
}
