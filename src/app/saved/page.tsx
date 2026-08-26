import Link from "next/link";
import { MarketplaceGrid } from "@/components/MarketplaceGrid";
import { getSavedListings } from "@/lib/queries";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function SavedListingsPage() {
  const { userId } = await requireSession("/saved");
  const listings = await getSavedListings(userId);

  return <div className="space-y-7"><section className="console-panel overflow-hidden p-7 sm:p-9"><p className="text-sm font-bold text-emerald-300">Your shortlist</p><h1 className="mt-2 text-4xl font-black text-white">Saved offers</h1><p className="mt-3 max-w-xl text-slate-300">Keep track of the digital products and creative services you want to return to.</p></section>{listings.length ? <MarketplaceGrid listings={listings} heading="Your saved offers" savedListingIds={listings.map((listing) => listing.id)} /> : <section className="rounded-2xl border border-slate-200 bg-white/80 p-12 text-center shadow-sm"><h2 className="text-xl font-black text-slate-950">Your saved list is empty.</h2><p className="mt-2 text-slate-700">Tap Save on an offer to keep it here for later.</p><Link href="/marketplace" className="button-primary mt-6">Explore the marketplace</Link></section>}</div>;
}