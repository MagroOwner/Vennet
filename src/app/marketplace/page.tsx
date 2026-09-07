import Link from "next/link";
import { MarketplaceGrid } from "@/components/MarketplaceGrid";
import { CategoryFilter } from "@/components/CategoryFilter";
import { getActiveListings, getListingTrust, getSavedListingIds } from "@/lib/queries";
import { auth } from "@/lib/auth";
import { LISTING_CATEGORIES, type ListingCategory } from "@/lib/types";
import { getCollection } from "@/lib/collections";

export const dynamic = "force-dynamic";
function parseCategory(value: string | undefined): ListingCategory | undefined { return LISTING_CATEGORIES.find((category) => category === value); }

export default async function MarketplacePage({ searchParams }: { searchParams: { category?: string; collection?: string; q?: string; license?: string; delivery?: string; price?: string } }) {
  const category = parseCategory(searchParams.category);
  const collection = searchParams.collection && getCollection(searchParams.collection) ? searchParams.collection : "";
  const session = await auth();
  const [listings, savedListingIds] = await Promise.all([
    getActiveListings(category),
    session?.user?.id ? getSavedListingIds(session.user.id) : Promise.resolve([]),
  ]);
  const trustByListing = await getListingTrust(listings);
  return <div className="space-y-8">
    <section className="relative overflow-hidden rounded-[2rem] bg-[#10151f] px-6 py-10 text-white shadow-[0_20px_50px_rgb(16_21_31/.16)] sm:px-10 sm:py-12">
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="relative flex flex-wrap items-end justify-between gap-6">
        <div><p className="text-[11px] font-black uppercase tracking-[.18em] text-emerald-200">The Vennet marketplace</p><h1 className="mt-3 text-4xl font-black tracking-[-.05em] text-white sm:text-5xl">Find work worth owning.</h1><p className="mt-4 max-w-xl text-lg leading-7 text-slate-300">Digital products and creator services, organized around the details that help you decide.</p></div>
        <div className="flex flex-wrap items-center gap-3"><Link href="/collections" className="button-secondary border-white/20 bg-white/[.06] text-white hover:bg-white/[.12]">Collections</Link><CategoryFilter value={category ?? ""} /><Link href="/dashboard/seller" className="button-primary">Start selling</Link></div>
      </div>
    </section>
    <section>{listings.length === 0 ? <div className="surface-card p-12 text-center"><p className="text-lg font-black text-[#10151f]">Be the first to share something great.</p><p className="mt-2 text-slate-600">List a digital product or service in minutes.</p><Link href="/dashboard/seller" className="button-primary mt-6">Create an offer</Link></div> : <MarketplaceGrid listings={listings} savedListingIds={savedListingIds} initialCollection={collection} initialQuery={searchParams.q ?? ""} initialLicense={searchParams.license ?? ""} initialDelivery={searchParams.delivery ?? ""} initialPrice={searchParams.price ?? ""} trustByListing={trustByListing} heading={collection ? getCollection(collection)?.name + " offers" : category ? "Filtered offers" : "Explore offers"} />}</section>
  </div>;
}