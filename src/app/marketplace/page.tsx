import { ListingCard } from "@/components/ListingCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { getActiveListings } from "@/lib/queries";
import { LISTING_CATEGORIES, type ListingCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

function parseCategory(value: string | undefined): ListingCategory | undefined {
  return LISTING_CATEGORIES.find((c) => c === value);
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const category = parseCategory(searchParams.category);
  const listings = await getActiveListings(category);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <CategoryFilter value={category ?? ""} />
      </div>

      {listings.length === 0 ? (
        <p className="mt-12 text-center text-zinc-400">No listings found.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
