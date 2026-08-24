"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createListing } from "@/lib/actions/marketplace";
import { LISTING_CATEGORIES, type ListingCategory } from "@/lib/types";

export function NewListingForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ListingCategory>("other");
  const [price, setPrice] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFiles(files: FileList) {
    setUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/uploads/listing-image", {
          method: "POST",
          body,
        });
        const payload: { url?: string; error?: string } = await response.json();
        if (!response.ok || !payload.url) {
          setError(payload.error ?? "Upload failed.");
          return;
        }
        uploaded.push(payload.url);
      }
      setImageUrls((current) => [...current, ...uploaded].slice(0, 8));
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await createListing({
        title,
        description,
        category,
        priceCents: Math.round(Number(price) * 100),
        imageUrls,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/marketplace/${result.listingId}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <input
        required
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
      />
      <textarea
        required
        rows={5}
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as ListingCategory)}
        className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 capitalize"
      >
        {LISTING_CATEGORIES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <input
        required
        type="number"
        min="1"
        step="0.01"
        placeholder="Price (USD)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
      />
      <div>
        <label className="block text-sm text-zinc-400">Images (up to 8)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          className="mt-1 w-full text-sm"
        />
        {uploading && <p className="mt-1 text-sm text-zinc-400">Uploading…</p>}
        {imageUrls.length > 0 && (
          <div className="mt-2 flex gap-2">
            {imageUrls.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="h-16 w-16 rounded object-cover" />
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={busy || uploading}
        className="w-full rounded bg-emerald-600 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50"
      >
        {busy ? "Creating…" : "Create listing"}
      </button>
    </form>
  );
}
