import Link from "next/link";
import { notFound } from "next/navigation";
import { ReputationBadge, VerifiedBadge } from "@/components/Badges";
import { SaveListingButton } from "@/components/SaveListingButton";
import { ListingCard } from "@/components/ListingCard";
import { BuyButton } from "@/components/forms/BuyButton";
import { auth } from "@/lib/auth";
import { getActiveListings, getIdentity, getListing, getListingReviews, getReputationScore } from "@/lib/queries";
import { levelForScore } from "@/lib/services/reputation";
import { formatPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id);
  return { title: listing ? listing.title + " | Vennet" : "Offer not found | Vennet", description: listing?.description?.slice(0, 155) ?? "Discover digital work on Vennet." };
}

export default async function ListingPage({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id);
  if (!listing) notFound();

  const [seller, sellerScore, session, reviews, marketplaceListings] = await Promise.all([
    getIdentity(listing.sellerId),
    getReputationScore(listing.sellerId),
    auth(),
    getListingReviews(listing.id),
    getActiveListings(undefined, 60),
  ]);
  const isOwnListing = session?.user?.id === listing.sellerId;
  const averageRating = reviews.length ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : null;
  const listingDetails = listing as typeof listing & { previewUrl?: string | null; licenseType?: string | null; deliveryTime?: string | null; tags?: string[] | null; collection?: string | null };
  const relatedOffers = marketplaceListings.filter((offer) => offer.id !== listing.id && (offer.category === listing.category || (listingDetails.collection && (offer as typeof listingDetails).collection === listingDetails.collection))).slice(0, 3);
  const creatorOffers = marketplaceListings.filter((offer) => offer.id !== listing.id && offer.sellerId === listing.sellerId).slice(0, 3);

  return (
    <main className="pb-12">
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-emerald-700">← Back to marketplace</Link>
      <div className="mt-5 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
        <section>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-2xl shadow-slate-900/15">
            {listing.imageUrls[0] ? <img src={listing.imageUrls[0]} alt={listing.title} className="aspect-[4/3] w-full object-cover" /> : <div className="grid aspect-[4/3] place-items-center bg-[radial-gradient(circle_at_50%_20%,rgba(52,211,153,.28),transparent_35%),linear-gradient(135deg,#1e293b,#020617)] text-7xl text-emerald-200">✦</div>}
          </div>
          {listing.imageUrls.length > 1 && <div className="mt-3 flex gap-3 overflow-x-auto pb-1">{listing.imageUrls.slice(1).map((url) => <div key={url} className="h-20 w-20 flex-none overflow-hidden rounded-xl border border-slate-200 bg-white"><img src={url} alt="" className="h-full w-full object-cover" /></div>)}</div>}
          {listingDetails.previewUrl && <a href={listingDetails.previewUrl} target="_blank" rel="noreferrer" className="mt-5 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-slate-900 transition hover:bg-emerald-100"><span><span className="block text-sm font-black">Try the preview</span><span className="mt-1 block text-sm text-slate-600">Open the seller’s sample, demo, or preview.</span></span><span className="text-lg text-emerald-700">↗</span></a>}
          <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-black uppercase tracking-[.14em] text-emerald-700">Secure checkout</p><p className="mt-2 text-sm font-bold text-slate-900">Powered by Stripe</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-black uppercase tracking-[.14em] text-emerald-700">Delivery</p><p className="mt-2 text-sm font-bold text-slate-900">Saved to your Inventory</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-black uppercase tracking-[.14em] text-emerald-700">Support</p><p className="mt-2 text-sm font-bold text-slate-900">Message from each order</p></div></div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black capitalize tracking-wide text-slate-700">{listing.category}</span><SaveListingButton listingId={listing.id} /></div>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-slate-950">{listing.title}</h1>
          <div className="mt-5 flex items-end justify-between gap-4"><p className="text-3xl font-black text-emerald-700">{formatPrice(listing.priceCents, listing.currency)}</p>{averageRating && <p className="text-sm font-bold text-amber-600">★ {averageRating.toFixed(1)} <span className="font-medium text-slate-500">({reviews.length} reviews)</span></p>}</div>
          <p className="mt-6 whitespace-pre-wrap text-base leading-7 text-slate-700">{listing.description}</p>

          <div className="mt-7 grid grid-cols-2 gap-3 border-y border-slate-100 py-5 text-sm"><div><p className="font-bold text-slate-900">What you receive</p><p className="mt-1 text-slate-600">{listing.category === "services" ? "A digital service and direct delivery details" : "Digital access after purchase"}</p></div><div><p className="font-bold text-slate-900">License</p><p className="mt-1 capitalize text-slate-600">{listingDetails.licenseType || "See seller details"}</p></div><div><p className="mt-2 font-bold text-slate-900">Delivery expectation</p><p className="mt-1 text-slate-600">{listingDetails.deliveryTime || "Access is provided after purchase"}</p></div><div><p className="mt-2 font-bold text-slate-900">Support</p><p className="mt-1 text-slate-600">Available in your order inventory</p></div></div>
          {listingDetails.tags?.length ? <div className="mt-5 flex flex-wrap gap-2">{listingDetails.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">#{tag}</span>)}</div> : null}

          <div className="mt-7">{isOwnListing ? <Link href={"/marketplace/" + listing.id + "/edit"} className="flex w-full justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800">Edit this listing</Link> : <BuyButton listingId={listing.id} available={listing.status === "active"} signedIn={Boolean(session?.user?.id)} />}</div>
          <p className="mt-3 text-center text-xs leading-5 text-slate-500">Secure Stripe checkout. Your order, access details, and seller support appear in Inventory.</p>
        </section>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
        {seller && <Link href={"/identity/" + seller.userId} className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Sold by</p><div className="mt-4 flex items-center gap-3">{seller.avatarUrl ? <img src={seller.avatarUrl} alt="" className="h-12 w-12 rounded-2xl object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-300 font-black text-slate-950">{seller.name.slice(0, 1).toUpperCase()}</div>}<div><p className="font-black">{seller.name}</p><div className="mt-2 flex flex-wrap gap-2"><VerifiedBadge status={seller.verificationStatus} /><ReputationBadge score={seller.reputationScore} level={sellerScore?.level ?? levelForScore(seller.reputationScore)} /></div></div></div><p className="mt-5 text-sm text-slate-300">Visit this creator’s storefront and explore more work →</p></Link>}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Verified buyer reviews</p><h2 className="mt-1 text-2xl font-black text-slate-950">What customers say</h2></div>{averageRating && <span className="text-lg font-black text-amber-600">★ {averageRating.toFixed(1)}</span>}</div>{reviews.length ? <div className="mt-5 space-y-4">{reviews.slice(0, 3).map((review) => <article key={review.id} className="rounded-2xl bg-slate-50 p-4"><p className="font-bold text-amber-600">{"★".repeat(review.rating)}<span className="text-slate-300">{"★".repeat(5 - review.rating)}</span></p>{review.body && <p className="mt-2 text-sm leading-6 text-slate-700">{review.body}</p>}<p className="mt-3 text-xs font-semibold text-slate-500">Verified Vennet purchase</p></article>)}</div> : <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">No reviews yet. Reviews can only be written by verified buyers after a completed purchase.</p>}</div>
      </section>

      {(relatedOffers.length > 0 || creatorOffers.length > 0) && <section className="mt-10 space-y-9">{relatedOffers.length > 0 && <div><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700">Keep exploring</p><h2 className="mt-1 text-2xl font-black text-slate-950">More you might like</h2></div><Link href="/marketplace" className="text-sm font-black text-emerald-800">View marketplace →</Link></div><div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{relatedOffers.map((offer) => <ListingCard key={offer.id} listing={offer} />)}</div></div>}{creatorOffers.length > 0 && <div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700">From this creator</p><h2 className="mt-1 text-2xl font-black text-slate-950">More work by {seller?.name ?? "this seller"}</h2><div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{creatorOffers.map((offer) => <ListingCard key={offer.id} listing={offer} />)}</div></div>}</section>}
    </main>
  );
}
