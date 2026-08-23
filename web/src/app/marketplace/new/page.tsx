"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { createListing } from "@/lib/callables";
import { uploadListingImage } from "@/lib/services";
import { LISTING_CATEGORIES, type ListingCategory } from "@/lib/types";

export default function NewListingPage() {
  return (
    <RequireAuth>
      <NewListingForm />
    </RequireAuth>
  );
}

function NewListingForm() {
  const router = useRouter();
  const { user, identity } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ListingCategory>("other");
  const [price, setPrice] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      const priceCents = Math.round(parseFloat(price) * 100);
      const draftId = `draft-${Date.now()}`;
      const imageUrls: string[] = [];
      if (files) {
        for (const file of Array.from(files).slice(0, 8)) {
          imageUrls.push(await uploadListingImage(user.uid, draftId, file));
        }
      }
      const res = await createListing({ title, description, category, priceCents, imageUrls });
      router.push(`/marketplace/${res.listingId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing");
    } finally {
      setBusy(false);
    }
  }

  if (!identity) {
    return (
      <p className="text-center text-zinc-400">
        You need a Vennet identity before selling. Create one from your dashboard.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold">Create a listing</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input
          required
          minLength={3}
          maxLength={120}
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
        />
        <textarea
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
        />
        <div className="flex gap-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ListingCategory)}
            className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 capitalize"
          >
            {LISTING_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            required
            type="number"
            min={1}
            max={100000}
            step="0.01"
            placeholder="Price (USD)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Images (up to 8)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="w-full text-sm text-zinc-400"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded bg-emerald-600 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50"
        >
          {busy ? "Publishing…" : "Publish listing"}
        </button>
      </form>
    </div>
  );
}
