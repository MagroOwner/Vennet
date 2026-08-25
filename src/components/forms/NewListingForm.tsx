/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createListing, updateListing } from "@/lib/actions/marketplace";
import type { Listing, ListingCategory } from "@/lib/types";

const OFFER_TYPES: { value: ListingCategory; label: string }[] = [
  { value: "digital", label: "Digital product" },
  { value: "services", label: "Service" },
  { value: "other", label: "Subscription or membership" },
];

type DeliveryFile = { pathname: string; name: string };

function fileName(pathname: string) {
  return pathname.split("/").pop() || "Uploaded file";
}

export function NewListingForm({ isPro, listing }: { isPro: boolean; listing?: Listing }) {
  const router = useRouter();
  const isEditing = Boolean(listing);
  const [title, setTitle] = useState(listing?.title ?? "");
  const [description, setDescription] = useState(listing?.description ?? "");
  const [category, setCategory] = useState<ListingCategory>(listing?.category ?? "digital");
  const [price, setPrice] = useState(listing ? (listing.priceCents / 100).toFixed(2) : "");
  const [imageUrls, setImageUrls] = useState<string[]>(listing?.imageUrls ?? []);
  const [deliveryFiles, setDeliveryFiles] = useState<DeliveryFile[]>(
    (listing?.deliveryFilePaths ?? []).map((pathname) => ({ pathname, name: fileName(pathname) }))
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState(listing?.deliveryInstructions ?? "");
  const [supportContact, setSupportContact] = useState(listing?.supportContact ?? "");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadImages(files: FileList) {
    setUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files).slice(0, 8 - imageUrls.length)) {
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/uploads/listing-image", { method: "POST", body });
        const payload: { url?: string; error?: string } = await response.json();
        if (!response.ok || !payload.url) {
          setError(payload.error ?? "Image upload failed.");
          return;
        }
        uploaded.push(payload.url);
      }
      setImageUrls((current) => [...current, ...uploaded].slice(0, 8));
    } finally {
      setUploading(false);
    }
  }

  async function uploadDeliveryFiles(files: FileList) {
    setUploading(true);
    setError(null);
    try {
      const uploaded: DeliveryFile[] = [];
      for (const file of Array.from(files).slice(0, 8 - deliveryFiles.length)) {
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/uploads/delivery-file", { method: "POST", body });
        const payload: { pathname?: string; name?: string; error?: string } = await response.json();
        if (!response.ok || !payload.pathname || !payload.name) {
          setError(payload.error ?? "File upload failed.");
          return;
        }
        uploaded.push({ pathname: payload.pathname, name: payload.name });
      }
      setDeliveryFiles((current) => [...current, ...uploaded]);
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (category === "digital" && deliveryFiles.length === 0) {
      setError("Upload at least one file that the buyer receives.");
      return;
    }
    setBusy(true);
    try {
      const input = {
        title,
        description,
        category,
        priceCents: Math.round(Number(price) * 100),
        imageUrls,
        deliveryFilePaths: deliveryFiles.map((file) => file.pathname),
        deliveryInstructions,
        supportContact,
      };
      const result = listing
        ? await updateListing({ ...input, listingId: listing.id })
        : await createListing(input);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(isEditing ? "/dashboard/seller" : "/marketplace/" + result.listingId);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const availableOfferTypes = isPro || listing?.category === "other"
    ? OFFER_TYPES
    : OFFER_TYPES.filter((option) => option.value !== "other");
  const limitMessage = isPro
    ? "Pro limits: 10 digital products, 4 services, and 2 subscriptions."
    : "Free limits: 2 digital products and 1 service. Upgrade to Pro to list subscriptions and unlock more listings.";

  return (
    <form onSubmit={submit} className="mt-6 space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-950">Listing details</h2>
        <p className="mt-1 text-sm text-slate-700">Keep the description, price, and offer type accurate for buyers.</p>
        <div className="mt-5 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-900">What are you selling?</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as ListingCategory)} className="w-full rounded-xl border border-slate-300 bg-slate-950 px-3 py-2.5 text-white">
              {availableOfferTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <p className="mt-2 text-sm text-slate-700">{limitMessage}</p>
            {!isPro && <a href="/pro" className="mt-1 inline-block text-sm font-bold text-emerald-700 hover:text-emerald-800">Explore Vennet Pro →</a>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-900">Title</label>
            <input required placeholder="e.g. Brand identity template" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-950 px-3 py-2.5 text-white" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-900">Description</label>
            <textarea required rows={5} placeholder="Describe what the buyer receives, how it is delivered, and any requirements." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-950 px-3 py-2.5 text-white" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-900">Price (USD)</label>
            <input required type="number" min="1" step="0.01" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-950 px-3 py-2.5 text-white" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-950">Images</h2>
        <p className="mt-1 text-sm text-slate-700">Add up to eight images to help buyers understand your offer.</p>
        <input type="file" accept="image/*" multiple onChange={(e) => e.target.files && uploadImages(e.target.files)} className="mt-4 block w-full text-sm font-medium text-slate-800" />
        {imageUrls.length > 0 && <div className="mt-4 flex flex-wrap gap-3">{imageUrls.map((url) => <div key={url} className="relative"><img src={url} alt="" className="h-20 w-20 rounded-xl object-cover" /><button type="button" onClick={() => setImageUrls((current) => current.filter((image) => image !== url))} className="absolute -right-2 -top-2 rounded-full bg-slate-950 px-2 py-0.5 text-xs font-bold text-white shadow">Remove</button></div>)}</div>}
      </section>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-5 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-950">Buyer delivery and support</h2>
        <p className="mt-1 text-sm text-slate-700">This information is shown to a buyer after payment. Keep it current while your listing is active.</p>
        {category === "digital" && <div className="mt-5 rounded-xl border border-emerald-200 bg-white p-4">
          <label className="block text-sm font-bold text-slate-950">Files the buyer receives</label>
          <p className="mt-1 text-sm leading-5 text-slate-700">Required for digital products. Upload up to eight files, or use a ZIP file for a folder. Only verified buyers can download them after payment.</p>
          <input type="file" multiple onChange={(e) => e.target.files && uploadDeliveryFiles(e.target.files)} className="mt-3 block w-full text-sm font-medium text-slate-800" />
          {deliveryFiles.length > 0 && <ul className="mt-3 space-y-2">{deliveryFiles.map((file) => <li key={file.pathname} className="flex items-center justify-between gap-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-950"><span className="min-w-0 truncate">✓ {file.name}</span><button type="button" onClick={() => setDeliveryFiles((current) => current.filter((item) => item.pathname !== file.pathname))} className="shrink-0 text-emerald-800 underline hover:text-emerald-950">Remove</button></li>)}</ul>}
        </div>}
        <div className="mt-5">
          <label className="mb-1.5 block text-sm font-bold text-slate-900">Buyer access details</label>
          <textarea required rows={4} placeholder={category === "digital" ? "Explain what the files contain and how the buyer should use them." : "Explain exactly how the buyer accesses the service or subscription after purchase."} value={deliveryInstructions} onChange={(e) => setDeliveryInstructions(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-950 px-3 py-2.5 text-white" />
        </div>
        <div className="mt-5">
          <label className="mb-1.5 block text-sm font-bold text-slate-900">Seller support contact</label>
          <input required placeholder="Support email, Discord invite, help desk URL, or other contact method" value={supportContact} onChange={(e) => setSupportContact(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-950 px-3 py-2.5 text-white" />
        </div>
      </section>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</p>}
      <button type="submit" disabled={busy || uploading} className="button-primary w-full disabled:opacity-50">{busy ? (isEditing ? "Saving…" : "Publishing…") : (isEditing ? "Save listing changes" : "Publish listing")}</button>
    </form>
  );
}
