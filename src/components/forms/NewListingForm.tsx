/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createListing } from "@/lib/actions/marketplace";
import type { ListingCategory } from "@/lib/types";

const OFFER_TYPES: { value: ListingCategory; label: string }[] = [
  { value: "digital", label: "Digital product" },
  { value: "services", label: "Service" },
  { value: "other", label: "Subscription or membership" },
];

export function NewListingForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ListingCategory>("digital");
  const [price, setPrice] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFiles(files: FileList) {
    setUploading(true); setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const body = new FormData(); body.append("file", file);
        const response = await fetch("/api/uploads/listing-image", { method: "POST", body });
        const payload: { url?: string; error?: string } = await response.json();
        if (!response.ok || !payload.url) { setError(payload.error ?? "Upload failed."); return; }
        uploaded.push(payload.url);
      }
      setImageUrls((current) => [...current, ...uploaded].slice(0, 8));
    } finally { setUploading(false); }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(null); setBusy(true);
    try {
      const result = await createListing({ title, description, category, priceCents: Math.round(Number(price) * 100), imageUrls });
      if (!result.ok) { setError(result.error); return; }
      router.push(`/marketplace/${result.listingId}`);
    } finally { setBusy(false); }
  }

  return <form onSubmit={submit} className="mt-6 space-y-4">
    <div><label className="mb-1 block text-sm font-medium">What are you selling?</label><select value={category} onChange={(e) => setCategory(e.target.value as ListingCategory)} className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2">{OFFER_TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
    <div><label className="mb-1 block text-sm font-medium">Title</label><input required placeholder="e.g. Brand identity template" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2" /></div>
    <div><label className="mb-1 block text-sm font-medium">Description</label><textarea required rows={5} placeholder="Describe what the buyer receives, how it is delivered, and any requirements." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2" /></div>
    <div><label className="mb-1 block text-sm font-medium">Price (USD)</label><input required type="number" min="1" step="0.01" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2" /></div>
    <div><label className="block text-sm font-medium">Cover images <span className="font-normal text-zinc-500">(optional, up to 8)</span></label><input type="file" accept="image/*" multiple onChange={(e) => e.target.files && uploadFiles(e.target.files)} className="mt-2 w-full text-sm" />{uploading && <p className="mt-1 text-sm text-zinc-400">Uploading…</p>}{imageUrls.length > 0 && <div className="mt-2 flex gap-2">{imageUrls.map((url) => <img key={url} src={url} alt="" className="h-16 w-16 rounded object-cover" />)}</div>}</div>
    {error && <p className="text-sm text-red-400">{error}</p>}<button type="submit" disabled={busy || uploading} className="w-full rounded bg-emerald-500 py-3 font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50">{busy ? "Publishing…" : "Publish offer"}</button>
  </form>;
}
