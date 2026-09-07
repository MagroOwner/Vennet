"use client";

import Link from "next/link";
import { useState } from "react";

const visitorLinks = [
  ["Marketplace", "/marketplace"],
  ["Categories", "/collections"],
  ["Discover", "/discover"],
  ["Help", "/help"],
];

const memberLinks = [
  ["My library", "/inventory"],
  ["Saved", "/saved"],
  ["Sell on Vennet", "/dashboard/seller"],
];

export function MobileNav({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const links = signedIn ? [...visitorLinks.slice(0, 3), ...memberLinks, visitorLinks[3]] : visitorLinks;

  return <>
    <button type="button" aria-label="Open navigation menu" aria-expanded={open} onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 xl:hidden">
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" /></svg>
    </button>
    {open && <div className="fixed inset-0 z-[70] xl:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <button type="button" aria-label="Close navigation menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]" />
      <aside className="relative ml-auto flex h-full w-full max-w-sm flex-col bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5"><p className="text-lg font-black tracking-[-.04em] text-[#10151f]">Vennet menu</p><button type="button" aria-label="Close navigation menu" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-lg text-slate-700">×</button></div>
        <nav className="mt-5 space-y-1" aria-label="Mobile navigation">{links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-base font-bold text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-900">{label}</Link>)}</nav>
        <div className="mt-auto border-t border-slate-200 pt-5">{signedIn ? <Link href="/dashboard/seller" onClick={() => setOpen(false)} className="button-primary w-full">Create a listing</Link> : <div className="grid gap-3"><Link href="/signup" onClick={() => setOpen(false)} className="button-primary w-full">Join free</Link><Link href="/login" onClick={() => setOpen(false)} className="button-secondary w-full">Sign in</Link></div>}</div>
      </aside>
    </div>}
  </>;
}
