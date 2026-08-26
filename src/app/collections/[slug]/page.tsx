import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingCard } from "@/components/ListingCard";
import { COLLECTIONS, collectionMatchesListing, getCollection } from "@/lib/collections";
import { auth } from "@/lib/auth";
import { getActiveListings, getSavedListingIds } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function CollectionPage({ params }: { params: { slug: string } }) {
  const collection = getCollection(params.slug);
  if (!collection) notFound();
  const session = await auth();
  const [listings, savedListingIds] = await Promise.all([
    getActiveListings(undefined, 80),
    session?.user?.id ? getSavedListingIds(session.user.id) : Promise.resolve([]),
  ]);
  const offers = listings.filter((listing) => collectionMatchesListing(collection, listing));

  return <main className="space-y-8 pb-12">
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-7 py-10 text-white shadow-2xl shadow-slate-900/15 sm:px-10">
      <div className={"absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br " + collection.accent + " opacity-40 blur-3xl"} />
      <div className="relative"><Link href="/collections" className="text-sm font-bold text-emerald-200 transition hover:text-white">← All collections</Link><p className="mt-7 text-xs font-black uppercase tracking-[.2em] text-emerald-300">Curated collection</p><h1 className="mt-2 text-4xl font-black tracking-tight">{collection.name}</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">{collection.description}</p><div className="mt-6 flex flex-wrap gap-3"><Link href={"/marketplace?collection=" + collection.slug} className="rounded-xl bg-emerald-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-200">Explore all {collection.name}</Link><Link href="/dashboard/seller" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">Sell in this collection</Link></div></div>
    </section>
    <section><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700">Popular this week</p><h2 className="mt-1 text-2xl font-black text-slate-950">Made for your next project</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">{offers.length} offers</span></div>{offers.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{offers.slice(0, 12).map((listing, index) => <div key={listing.id} className="animate-rise" style={{ animationDelay: Math.min(index * 55, 330) + "ms" }}><ListingCard listing={listing} saved={savedListingIds.includes(listing.id)} /></div>)}</div> : <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm"><p className="text-lg font-black text-slate-950">This collection is just getting started.</p><p className="mt-2 text-sm text-slate-600">Creators can bring the first great {collection.name.toLowerCase()} offer to Vennet.</p><Link href="/dashboard/seller" className="button-primary mt-6">Create a listing</Link></div>}</section>
  </main>;
}

export function generateStaticParams() {
  return COLLECTIONS.map((collection) => ({ slug: collection.slug }));
}
