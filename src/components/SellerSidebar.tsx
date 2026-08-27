"use client";

import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";

const tools = [
  ["Seller overview", "/dashboard/seller", "⌂"],
  ["Create a listing", "/marketplace/new", "+"],
  ["Your listings", "/dashboard/seller", "▤"],
  ["Orders & delivery", "/inventory", "↗"],
  ["Promotions", "/dashboard/seller", "%"],
  ["Vennet AI", "/ai", "✦"],
  ["Payout setup", "/stripe/onboarding", "$"],
];

export function SellerSidebar() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

  function close() {
    setOpen(false);
    setMinimized(false);
  }

  const drawer = <><button aria-label="Close seller tools overlay" type="button" onClick={close} className="fixed inset-0 z-[90] cursor-default bg-slate-950/45 backdrop-blur-sm" />
    <aside aria-label="Seller tools" className={"fixed inset-y-0 left-0 z-[100] flex overflow-hidden border-r border-emerald-100 bg-gradient-to-b from-emerald-50 via-white to-slate-100 shadow-2xl shadow-slate-950/35 transition-[width,transform] duration-300 " + (minimized ? "w-20" : "w-[22rem]")}>
      {minimized ? <div className="flex w-full flex-col items-center gap-3 p-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400 text-lg font-black text-slate-950">V</span><button type="button" onClick={() => setMinimized(false)} aria-label="Expand seller tools" title="Expand sidebar" className="grid h-11 w-11 place-items-center rounded-xl border border-emerald-300 bg-emerald-400 text-xl font-black text-slate-950">›</button><div className="w-full border-t border-slate-200 pt-3">{tools.map(([label, href, icon]) => <Link key={label} href={href} onClick={close} aria-label={label} title={label} className="mb-2 grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-base font-black text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50">{icon}</Link>)}</div><button type="button" onClick={close} aria-label="Close seller tools" title="Close sidebar" className="mt-auto grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-xl font-black text-slate-600 hover:bg-slate-100">×</button></div> : <div className="flex h-full w-full flex-col p-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700">Creator workspace</p><h2 className="mt-1 text-xl font-black text-slate-950">Seller tools</h2></div><div className="flex gap-2"><button type="button" onClick={() => setMinimized(true)} aria-label="Minimize seller tools" title="Minimize sidebar" className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-base font-black text-slate-600 transition hover:bg-slate-100">‹</button><button type="button" onClick={close} aria-label="Close seller tools" className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-lg font-bold text-slate-600 transition hover:bg-slate-100">×</button></div></div>
        <Link href="/marketplace/new" onClick={close} className="mt-4 block rounded-xl bg-emerald-400 px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:bg-emerald-300">Create a listing +</Link>
        <nav className="mt-4 grid gap-2 sm:grid-cols-2">{tools.map(([label, href, icon]) => <Link key={label} href={href} onClick={close} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-black text-slate-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50"><span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-50 text-sm font-black text-emerald-800">{icon}</span>{label}</Link>)}</nav>
        <div className="mt-auto rounded-2xl bg-slate-950 p-4 text-white"><p className="text-xs font-black uppercase tracking-[.15em] text-emerald-300">Built for digital</p><p className="mt-1 text-sm font-bold leading-5">Create, sell, and deliver digital work in one place.</p><Link href="/pro" onClick={close} className="mt-2 inline-block text-sm font-black text-emerald-300 hover:text-emerald-200">Explore Vennet Pro →</Link></div>
      </div>}
    </aside></>;

  return <><button type="button" onClick={() => setOpen(true)} aria-label="Open seller tools" className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-sm font-black text-emerald-900 transition hover:border-emerald-400 hover:bg-emerald-100"><span aria-hidden="true">☰</span> Seller tools</button>{open ? createPortal(drawer, document.body) : null}</>;
}
