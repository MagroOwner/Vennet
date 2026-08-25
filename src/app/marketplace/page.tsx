import { ListingCard } from "@/components/ListingCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { getActiveListings } from "@/lib/queries";
import { LISTING_CATEGORIES, type ListingCategory } from "@/lib/types";

export const dynamic = "force-dynamic";
function parseCategory(value: string | undefined): ListingCategory | undefined { return LISTING_CATEGORIES.find((c) => c === value); }

export default async function MarketplacePage({ searchParams }: { searchParams: { category?: string } }) {
  const category = parseCategory(searchParams.category);
  const listings = await getActiveListings(category);
  return <div className="console-page">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-black">Marketplace Registry</h1><p className="mt-1 font-mono text-xs text-zinc-500">TRUSTED ASSET EXCHANGE // ESCROW PROTECTED</p></div><CategoryFilter value={category ?? ""} /></div>
    <section className="console-panel"><div className="console-panel-header"><h2 className="font-semibold"><span className="mr-2 text-emerald-400">▣</span>Asset Inventory</h2><span className="console-kicker">{listings.length} active listings</span></div>
      {listings.length === 0 ? <p className="p-8 text-center text-zinc-500">No assets found in the current registry.</p> : <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">{listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>}
    </section>
  </div>;
}
