"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setListingVisibility } from "@/lib/actions/marketplace";

export function ListingVisibilityButton({ listingId, status }: { listingId: string; status: "active" | "draft" | "sold" | "suspended" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState("");
  const isActive = status === "active";

  if (status === "suspended") return null;

  function changeVisibility() {
    if (isActive && !window.confirm("Remove this listing from the marketplace? Existing buyers will keep access to their purchase.")) return;
    startTransition(async () => {
      const result = await setListingVisibility({ listingId, visible: !isActive });
      if (!result.ok) {
        setNotice(result.error);
        return;
      }
      setNotice(isActive ? "Listing removed from the marketplace." : status === "draft" ? "Listing is live." : "Listing is live again.");
      router.refresh();
    });
  }

  return <div className="flex flex-col items-end gap-1"><button type="button" onClick={changeVisibility} disabled={pending} className={"rounded-lg border px-3 py-2 text-sm font-bold transition disabled:cursor-wait disabled:opacity-60 " + (isActive ? "border-rose-200 text-rose-700 hover:border-rose-400 hover:bg-rose-50" : "border-emerald-300 text-emerald-800 hover:bg-emerald-50")}>{pending ? "Saving…" : isActive ? "Remove" : status === "draft" ? "Publish" : "Restore"}</button>{notice && <p role="status" className="max-w-40 text-right text-xs font-medium text-slate-600">{notice}</p>}</div>;
}
