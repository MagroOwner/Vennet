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
  return <div className="space-y-8">
    <section className="console-panel relative overflow-hidden px-6 py-10 sm:px-10"><div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" /><div className="relative flex flex-wrap items-end justify-between gap-5"><div><p className="text-sm font-semibold text-emerald-300">The Vennet marketplace</p><h1 className="mt-3 text-4xl font-black tracking-tight text-white">Find work worth owning.</h1><p className="mt-3 max-w-xl text-slate-300">Discover digital products and services made by independent creators.</p></div><div className="flex items-center gap-3"><CategoryFilter value={category ?? ""} /><Link href="/dashboard/seller" className="button-primary px-4 py-2.5 text-sm">Start selling</Link></div></div></section>
    <section><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold text-white">{category ? "Filtered offers" : "Explore offers"}</h2><span className="text-sm text-slate-400">{listings.length} available</span></div>{listings.length === 0 ? <div className="console-panel p-12 text-center"><p className="text-lg font-bold">Be the first to share something great.</p><p className="mt-2 text-slate-400">List a digital product or service in minutes.</p><Link href="/dashboard/seller" className="button-primary mt-6">Create an offer</Link></div> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>}</section>
  </div>;
}
