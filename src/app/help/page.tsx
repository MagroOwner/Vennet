import Link from "next/link";
import { HelpGuides } from "@/components/HelpGuides";

export default function HelpPage() {
  return <div className="space-y-7">
    <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-7 py-10 text-white shadow-xl shadow-slate-950/15 sm:px-10"><div className="absolute -right-14 -top-16 h-60 w-60 rounded-full bg-emerald-400/25 blur-3xl" /><div className="relative max-w-2xl"><p className="text-sm font-black uppercase tracking-[.18em] text-emerald-300">Vennet Help</p><h1 className="mt-3 text-4xl font-black tracking-tight">Simple guides for buying and selling digital work.</h1><p className="mt-4 text-lg leading-8 text-slate-300">Open a tutorial and keep its instructions visible in the guide panel while you work.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/marketplace" className="button-primary px-4 py-2.5 text-sm">Explore marketplace</Link><Link href="/dashboard/seller" className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/10">Open seller hub</Link></div></div></section>
    <HelpGuides />
    <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-7"><h2 className="text-xl font-black text-emerald-950">Need a quick answer?</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-900">Use the page finder at the top to jump to any area of Vennet. For order-specific questions, open the purchase from My library and contact the seller through its support area.</p></section>
  </div>;
}
