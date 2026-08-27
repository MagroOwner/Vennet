"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { purchaseListing } from "@/lib/actions/marketplace";

export function BuyButton({ listingId, available, signedIn }: { listingId: string; available: boolean; signedIn: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    if (!signedIn) {
      router.push(`/login?next=/marketplace/${listingId}`);
      return;
    }
    if (!termsAccepted) {
      setError("Please agree to the Terms of Service before continuing.");
      return;
    }
    setBusy(true);
    setError(null);
    const result = await purchaseListing({ listingId, couponCode: couponCode || undefined, termsAccepted: true });
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    window.location.assign(result.url);
  }

  return <div className="mt-6">
    {error && <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
    {showCoupon ? <div className="mb-3 flex gap-2"><input value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} placeholder="Launch offer code" className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-bold text-slate-900" /><button type="button" onClick={() => { setCouponCode(""); setShowCoupon(false); }} className="rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700">Remove</button></div> : <button type="button" onClick={() => setShowCoupon(true)} className="mb-3 text-sm font-bold text-emerald-800 hover:text-emerald-950">Have a launch offer code?</button>}
    <label className="mb-3 flex items-start gap-2 text-xs leading-5 text-slate-600"><input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-0.5 h-4 w-4 accent-emerald-600" /> <span>I agree to the <a href="/terms" target="_blank" rel="noreferrer" className="font-bold text-emerald-800 underline">Terms of Service</a>, including the digital delivery and refund terms.</span></label>
    <button onClick={buy} disabled={busy || !available || !termsAccepted} className="w-full rounded-xl bg-emerald-600 py-3 font-black text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-500 disabled:opacity-50">{!available ? "Not available" : busy ? "Opening secure checkout…" : "Buy now"}</button>
  </div>;
}
