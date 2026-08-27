"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ListingCard } from "@/components/ListingCard";
import { SaveSearchButton } from "@/components/SaveSearchButton";
import { COLLECTIONS, collectionMatchesListing } from "@/lib/collections";
import type { Listing } from "@/lib/types";

type DisplaySize = "small" | "medium" | "large";
type Sort = "newest" | "price-low" | "price-high" | "popular";
type ListingTrust = { averageRating: number | null; reviewCount: number; sellerVerified: boolean };
type MarketplaceListing = Listing & { collection?: string | null; licenseType?: string | null; deliveryTime?: string | null; tags?: string[] | null; fileType?: string | null; compatibility?: string | null; includesUpdates?: boolean | null };

const gridClasses: Record<DisplaySize, string> = {
  small: "grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  medium: "grid gap-5 sm:grid-cols-2 xl:grid-cols-3",
  large: "grid gap-6 md:grid-cols-2",
};

export function MarketplaceGrid({ listings, heading = "Explore offers", savedListingIds = [], initialCollection = "", initialQuery = "", initialLicense = "", initialDelivery = "", initialPrice = "", trustByListing = {} }: { listings: Listing[]; heading?: string; savedListingIds?: string[]; initialCollection?: string; initialQuery?: string; initialLicense?: string; initialDelivery?: string; initialPrice?: string; trustByListing?: Record<string, ListingTrust> }) {
  const [size, setSize] = useState<DisplaySize>("medium");
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<Sort>("newest");
  const [collection, setCollection] = useState(initialCollection);
  const [license, setLicense] = useState(initialLicense);
  const [delivery, setDelivery] = useState(initialDelivery);
  const [price, setPrice] = useState(initialPrice);
  const [fileType, setFileType] = useState("");
  const [compatibility, setCompatibility] = useState("");
  const [updatesOnly, setUpdatesOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minimumRating, setMinimumRating] = useState("");
  const [offerType, setOfferType] = useState("");
  const [freshness, setFreshness] = useState("");
  const [previewOnly, setPreviewOnly] = useState(false);
  const enrichedListings = listings as MarketplaceListing[];

  useEffect(() => {
    const saved = window.localStorage.getItem("vennet-marketplace-size") as DisplaySize | null;
    if (saved === "small" || saved === "medium" || saved === "large") setSize(saved);
  }, []);

  const visibleListings = useMemo(() => {
    const term = query.trim().toLowerCase();
    const selectedCollection = COLLECTIONS.find((item) => item.slug === collection);
    return [...enrichedListings]
      .filter((listing) => !term || [listing.title, listing.description, listing.collection ?? "", ...(listing.tags ?? [])].join(" ").toLowerCase().includes(term))
      .filter((listing) => !offerType || listing.category === offerType)
      .filter((listing) => !previewOnly || Boolean(listing.previewUrl || listing.imageUrls?.length))
      .filter((listing) => { if (!freshness) return true; const days = Number(freshness); return new Date(listing.createdAt).getTime() >= Date.now() - days * 24 * 60 * 60 * 1000; })
      .filter((listing) => !selectedCollection || collectionMatchesListing(selectedCollection, listing))
      .filter((listing) => !license || listing.licenseType?.toLowerCase().includes(license))
      .filter((listing) => !delivery || (listing.deliveryTime ?? "").toLowerCase().includes(delivery))
      .filter((listing) => !fileType || (listing.fileType ?? "").toLowerCase().includes(fileType))
      .filter((listing) => !compatibility || (listing.compatibility ?? "").toLowerCase().includes(compatibility))
      .filter((listing) => !updatesOnly || Boolean(listing.includesUpdates))
      .filter((listing) => !verifiedOnly || Boolean(trustByListing[listing.id]?.sellerVerified))
      .filter((listing) => !minimumRating || (trustByListing[listing.id]?.averageRating ?? 0) >= Number(minimumRating))
      .filter((listing) => {
        if (price === "under-25") return listing.priceCents < 2500;
        if (price === "25-100") return listing.priceCents >= 2500 && listing.priceCents <= 10000;
        if (price === "over-100") return listing.priceCents > 10000;
        return true;
      })
      .sort((a, b) => {
        if (sort === "price-low") return a.priceCents - b.priceCents;
        if (sort === "price-high") return b.priceCents - a.priceCents;
        if (sort === "popular") return b.purchaseCount - a.purchaseCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [enrichedListings, query, sort, collection, license, delivery, price, fileType, compatibility, updatesOnly, verifiedOnly, minimumRating, offerType, freshness, previewOnly, trustByListing]);

  function chooseSize(nextSize: DisplaySize) {
    setSize(nextSize);
    window.localStorage.setItem("vennet-marketplace-size", nextSize);
  }

  function clearFilters() {
    setQuery("");
    setCollection("");
    setLicense("");
    setDelivery("");
    setPrice("");
    setFileType("");
    setCompatibility("");
    setUpdatesOnly(false);
    setVerifiedOnly(false);
    setMinimumRating("");
    setOfferType("");
    setFreshness("");
    setPreviewOnly(false);
  }

  return (
    <>
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-xl shadow-slate-900/5 backdrop-blur sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><h2 className="text-2xl font-black tracking-tight text-slate-950">{heading}</h2><p className="mt-1 text-sm text-slate-600">{visibleListings.length} of {listings.length} offers matched</p></div>
          <div className="inline-flex rounded-xl border border-slate-300 bg-white p-1 shadow-sm" aria-label="Listing display size">
            {(["small", "medium", "large"] as DisplaySize[]).map((option) => <button key={option} type="button" onClick={() => chooseSize(option)} className={size === option ? "rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold capitalize text-white" : "rounded-lg px-3 py-1.5 text-sm font-medium capitalize text-slate-600 transition hover:bg-slate-100"}>{option}</button>)}
          </div>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-[1.4fr_repeat(4,minmax(0,.7fr))]">
          <label className="sr-only" htmlFor="marketplace-search">Search offers</label>
          <input id="marketplace-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, skills, tools, and creators" className="rounded-xl border border-slate-300 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none ring-emerald-300 transition focus:ring-2" />
          <select aria-label="Collection" value={collection} onChange={(event) => setCollection(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-medium text-slate-800"><option value="">All collections</option>{COLLECTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select>
          <select aria-label="License type" value={license} onChange={(event) => setLicense(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-medium text-slate-800"><option value="">Any license</option><option value="personal">Personal use</option><option value="commercial">Commercial use</option><option value="extended">Extended use</option></select>
          <select aria-label="Delivery speed" value={delivery} onChange={(event) => setDelivery(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-medium text-slate-800"><option value="">Any delivery</option><option value="instant">Instant access</option><option value="day">Within a day</option><option value="week">Within a week</option></select>
          <select aria-label="Offer type" value={offerType} onChange={(event) => setOfferType(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-medium text-slate-800"><option value="">All offer types</option><option value="digital">Digital products</option><option value="services">Creator services</option><option value="other">Subscriptions</option></select>
          <select aria-label="Sort offers" value={sort} onChange={(event) => setSort(event.target.value as Sort)} className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-medium text-slate-800"><option value="newest">Newest first</option><option value="popular">Most popular</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select>
                    <select aria-label="Price range" value={price} onChange={(event) => setPrice(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-medium text-slate-800"><option value="">Any price</option><option value="under-25">Under $25</option><option value="25-100">$25–$100</option><option value="over-100">$100+</option></select>
          <select aria-label="New releases" value={freshness} onChange={(event) => setFreshness(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-medium text-slate-800"><option value="">Any release date</option><option value="7">Added this week</option><option value="30">Added this month</option></select>
          <select aria-label="File type" value={fileType} onChange={(event) => setFileType(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-medium text-slate-800"><option value="">Any format</option><option value="zip">ZIP</option><option value="pdf">PDF</option><option value="figma">Figma</option><option value="mp3">MP3</option><option value="video">Video</option><option value="javascript">JavaScript</option><option value="typescript">TypeScript</option></select>
          <select aria-label="Compatibility" value={compatibility} onChange={(event) => setCompatibility(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-medium text-slate-800"><option value="">Any compatibility</option><option value="mac">Mac</option><option value="windows">Windows</option><option value="notion">Notion</option><option value="figma">Figma</option><option value="canva">Canva</option><option value="discord">Discord</option><option value="slack">Slack</option><option value="zapier">Zapier</option><option value="make">Make</option><option value="n8n">n8n</option></select>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-3"><label className="inline-flex items-center gap-2 text-sm font-bold text-slate-700"><input type="checkbox" checked={updatesOnly} onChange={(event) => setUpdatesOnly(event.target.checked)} className="h-4 w-4 accent-emerald-600" /> Includes future updates</label><label className="inline-flex items-center gap-2 text-sm font-bold text-slate-700"><input type="checkbox" checked={previewOnly} onChange={(event) => setPreviewOnly(event.target.checked)} className="h-4 w-4 accent-emerald-600" /> Has a preview</label><label className="inline-flex items-center gap-2 text-sm font-bold text-slate-700"><input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} className="h-4 w-4 accent-emerald-600" /> Verified sellers</label><select aria-label="Minimum rating" value={minimumRating} onChange={(event) => setMinimumRating(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-semibold text-slate-800"><option value="">Any rating</option><option value="4">4★ & up</option><option value="4.5">4.5★ & up</option></select></div><p className="text-xs font-medium text-slate-500">Filter by type, release date, format, compatibility, license, delivery, and price.</p><div className="flex items-center gap-3"><SaveSearchButton query={query} collection={collection} license={license} delivery={delivery} price={price} /><button type="button" onClick={clearFilters} className="text-sm font-bold text-emerald-800 hover:text-emerald-950">Clear filters</button></div></div>
      </div>

      {visibleListings.length === 0 ? <div className="mt-5 rounded-3xl border border-slate-200 bg-white/80 p-10 text-center shadow-sm"><p className="text-lg font-bold text-slate-950">Nothing matches those filters yet.</p><p className="mt-2 text-sm text-slate-600">Try a broader search or discover another collection.</p><div className="mt-5 flex justify-center gap-3"><button type="button" onClick={clearFilters} className="button-primary">Clear filters</button><Link href="/collections" className="button-secondary">Browse collections</Link></div></div> : <div className={"mt-5 " + gridClasses[size]}>{visibleListings.map((listing, index) => <div key={listing.id} className="animate-rise" style={{ animationDelay: Math.min(index * 55, 440) + "ms" }}><ListingCard listing={listing} size={size} saved={savedListingIds.includes(listing.id)} verifiedSeller={trustByListing[listing.id]?.sellerVerified} rating={trustByListing[listing.id]?.averageRating ? { average: trustByListing[listing.id].averageRating as number, count: trustByListing[listing.id].reviewCount } : null} /></div>)}</div>}
    </>
  );
}
