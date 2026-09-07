import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { CollectionIcon } from "@/components/CollectionIcon";
import { COLLECTIONS } from "@/lib/collections";
import { getActiveListings, getFeaturedCreators } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Discover digital creators | Vennet",
  description: "Featured digital creators, trending tools, and original work on Vennet.",
};

export default async function DiscoverPage() {
  const [listings, creators] = await Promise.all([getActiveListings(undefined, 24), getFeaturedCreators(6)]);
  const trending = [...listings]
    .sort((a, b) => b.purchaseCount - a.purchaseCount || b.viewCount - a.viewCount)
    .slice(0, 6);

  return <main className="space-y-12 pb-12">
    <section className="relative overflow-hidden rounded-[2rem] bg-[#10151f] px-7 py-12 text-white shadow-[0_24px_60px_rgb(16_21_31/.18)] sm:px-10">
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="relative max-w-2xl">
        <p className="eyebrow text-emerald-200">Fresh from Vennet</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-.05em] sm:text-5xl">Digital work with real momentum.</h1>
        <p className="mt-4 text-base leading-7 text-slate-300">Meet independent creators, discover useful digital tools, and find the work people are returning to right now.</p>
        <Link href="/marketplace" className="button-primary mt-7">Explore every offer →</Link>
      </div>
    </section>

    {trending.length >= 3 ? <section>
      <div className="flex items-end justify-between gap-4">
        <div><p className="eyebrow">Editorial discovery</p><h2 className="mt-2 text-3xl font-black tracking-[-.04em] text-[#10151f]">Trending digital tools</h2></div>
        <Link href="/marketplace?sort=popular" className="text-sm font-black text-emerald-800">See marketplace →</Link>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{trending.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>
    </section> : null}

    {creators.length ? <section>
      <div><p className="eyebrow">Featured creators</p><h2 className="mt-2 text-3xl font-black tracking-[-.04em] text-[#10151f]">People making useful things</h2></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{creators.map((creator) => <Link key={creator.userId} href={"/identity/" + creator.userId} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/[.05] transition hover:-translate-y-1 hover:border-emerald-300">
        <div className="flex items-center gap-3">{creator.avatarUrl ? <img src={creator.avatarUrl} alt="" className="h-12 w-12 rounded-2xl object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 font-black text-emerald-950">{creator.name.slice(0, 1).toUpperCase()}</div>}<div><p className="font-black text-[#10151f]">{creator.name}</p><p className="mt-1 text-sm font-semibold text-emerald-700">{creator.reputationScore}% reputation</p></div></div>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{creator.bio || "Explore this creator’s digital storefront."}</p><span className="mt-4 inline-flex text-sm font-black text-emerald-800">Visit storefront →</span>
      </Link>)}</div>
    </section> : null}

    <section className="surface-card p-6 sm:p-8">
      <div><p className="eyebrow">Explore categories</p><h2 className="mt-2 text-3xl font-black tracking-[-.04em] text-[#10151f]">Find a useful starting point.</h2></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{COLLECTIONS.map((collection) => <Link key={collection.slug} href={"/collections/" + collection.slug} className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#fbfcfb] p-4 font-black text-[#10151f] transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white">
        <span className={"grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br " + collection.accent}><CollectionIcon collection={collection} /></span><span>{collection.name}<span className="mt-1 block text-xs font-semibold text-emerald-800">Explore →</span></span>
      </Link>)}</div>
    </section>
  </main>;
}
