"use client";

import Link from "next/link";

export function QuickNav() {
  return <details className="fixed right-4 top-[4.75rem] z-20 md:right-6"><summary className="cursor-pointer list-none rounded-full border border-emerald-400/30 bg-slate-950 px-3 py-2 text-xs font-bold text-emerald-200 shadow-lg shadow-emerald-950/20 transition hover:bg-slate-900">☰ Pages</summary><div className="mt-2 w-48 rounded-2xl border border-white/10 bg-slate-950 p-2 shadow-2xl"><Link href="/marketplace" className="block rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-white/10">Explore marketplace</Link><Link href="/dashboard" className="block rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-white/10">Dashboard</Link><Link href="/inventory" className="block rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-white/10">Inventory</Link><Link href="/profile" className="block rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-white/10">Profile</Link><Link href="/settings" className="block rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-white/10">Settings</Link></div></details>;
}
