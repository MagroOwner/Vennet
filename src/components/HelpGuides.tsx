"use client";

import { guides, openGuide } from "./GuidePanel";

export function HelpGuides() {
  return <section><div className="mb-5"><p className="text-sm font-black uppercase tracking-[.16em] text-emerald-700">Tutorials</p><h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Start here</h2><p className="mt-2 text-sm text-slate-600">Open a guide to keep a step-by-step checklist visible anywhere you go on Vennet.</p></div>
    <div className="grid gap-5 md:grid-cols-2">{guides.map((guide) => <button key={guide.id} type="button" onClick={() => openGuide(guide.id)} className="rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-lg shadow-slate-900/[0.04] transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-xl"><div className="flex items-start gap-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-sm font-black text-emerald-800">{guide.number}</span><div><h3 className="text-xl font-black text-slate-950">{guide.title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{guide.summary}</p></div></div><span className="mt-5 inline-block text-sm font-black text-emerald-800">Open checklist →</span></button>)}</div>
  </section>;
}
