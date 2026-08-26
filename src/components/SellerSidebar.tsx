"use client";

import Link from "next/link";
import { useState } from "react";

const tools = [
  ["Seller overview", "/dashboard/seller", "See sales and performance"],
  ["Create a listing", "/marketplace/new", "Publish a digital offer"],
  ["Your listings", "/dashboard/seller", "Edit your catalogue"],
  ["Orders & delivery", "/inventory", "Review buyer access"],
  ["Promotions", "/dashboard/seller", "Coupons, bundles, and referrals"],
  ["Vennet AI", "/ai", "Pro creator assistant"],
  ["Payout setup", "/stripe/onboarding", "Connect Stripe"],
];

export function SellerSidebar() {
  const [open, setOpen] = useState(false);

  return <>
    <button type="button" onClick={() => setOpen(true)} aria-label="Open seller tools" className="fixed bottom-5 left-5 z-20 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-xl shadow-slate-950/25 transition hover:-translate-y-0.5 hover:bg-emerald-800">
      <span aria-hidden="true">☰</span> Seller tools
    </button>
    {open && <button aria-label="Close seller tools" type="button" onClick={() => setOpen(false)} className="fixed inset-0 z-40 cursor-default bg-slate-950/35 backdrop-blur-[1px]" />}
    <aside aria-label="Seller tools" className={"fixed bottom-0 left-0 top-0 z-50 flex w-[19rem] flex-col border-r border-slate-200 bg-white p-5 shadow-2xl transition-transform duration-300 " + (open ? "translate-x-0" : "-translate-x-full")}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-5"><div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700">Creator workspace</p><h2 className="mt-1 text-xl font-black text-slate-950">Seller tools</h2></div><button type="button" onClick={() => setOpen(false)} aria-label="Close seller tools" className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-lg font-bold text-slate-600 transition hover:bg-slate-100">×</button></div>
      <Link href="/marketplace/new" onClick={() => setOpen(false)} className="mt-5 rounded-xl bg-emerald-400 px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:bg-emerald-300">Create a listing +</Link>
      <nav className="mt-5 space-y-1 overflow-y-auto">{tools.map(([label, href, detail]) => <Link key={label} href={href} onClick={() => setOpen(false)} className="group block rounded-xl px-3 py-3 transition hover:bg-emerald-50"><p className="font-black text-slate-800 group-hover:text-emerald-900">{label}</p><p className="mt-0.5 text-xs font-medium text-slate-500">{detail}</p></Link>)}</nav>
      <div className="mt-auto rounded-2xl bg-slate-950 p-4 text-white"><p className="text-xs font-black uppercase tracking-[.15em] text-emerald-300">Built for digital</p><p className="mt-2 text-sm font-bold leading-5">Create, sell, and deliver digital work in one place.</p><Link href="/pro" onClick={() => setOpen(false)} className="mt-3 inline-block text-sm font-black text-emerald-300 hover:text-emerald-200">Explore Vennet Pro →</Link></div>
    </aside>
  </>;
}
