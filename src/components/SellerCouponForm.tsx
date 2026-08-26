"use client";

import { useState, useTransition } from "react";
import { createSellerCoupon } from "@/lib/actions/community";

export function SellerCouponForm() {
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("10");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    startTransition(async () => {
      const result = await createSellerCoupon({ code, discountPercent: Number(discount) });
      if (result.ok) {
        setMessage("Coupon is ready to share.");
        setCode("");
      } else {
        setMessage(result.error);
      }
    });
  }

  return <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
    <p className="text-sm font-black text-white">Create a launch offer</p>
    <p className="mt-1 text-sm leading-5 text-slate-300">Give customers a code for a percentage discount.</p>
    <div className="mt-4 grid grid-cols-[1fr_96px] gap-2">
      <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="WELCOME10" aria-label="Coupon code" className="min-w-0 rounded-xl border border-white/15 bg-slate-950 px-3 py-2.5 text-sm font-bold text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none" />
      <input value={discount} min="1" max="80" type="number" onChange={(event) => setDiscount(event.target.value)} aria-label="Discount percent" className="rounded-xl border border-white/15 bg-slate-950 px-3 py-2.5 text-sm font-bold text-white focus:border-emerald-300 focus:outline-none" />
    </div>
    <button disabled={pending || !code} className="mt-3 w-full rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-black text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50">{pending ? "Creating…" : "Create coupon"}</button>
    {message && <p className="mt-3 text-sm font-semibold text-emerald-200">{message}</p>}
  </form>;
}
