"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { purchaseListing } from "@/lib/actions/marketplace";

export function BuyButton({
  listingId,
  available,
  signedIn,
}: {
  listingId: string;
  available: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    if (!signedIn) {
      router.push(`/login?next=/marketplace/${listingId}`);
      return;
    }
    setBusy(true);
    setError(null);
    const result = await purchaseListing({ listingId });
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    window.location.assign(result.url);
  }

  return (
    <>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      <button
        onClick={buy}
        disabled={busy || !available}
        className="mt-6 w-full rounded-lg bg-emerald-600 py-3 font-medium hover:bg-emerald-500 disabled:opacity-50"
      >
        {!available ? "Not available" : busy ? "Processing…" : "Buy now"}
      </button>
    </>
  );
}
