"use client";

import Link from "next/link";
import { useState } from "react";
import { AD_SCENES, AdScene } from "./AdScene";

export function AdStudioPlayer() {
  const [activeScene, setActiveScene] = useState(0);
  const [paused, setPaused] = useState(false);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-emerald-950/10">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-emerald-700">Private recording studio</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Vennet Edit Clips</h1>
          <p className="mt-1 text-sm text-slate-500">{AD_SCENES.length} punchy vertical scenes built to cut together—not stock business footage.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setPaused((value) => !value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-800 transition hover:border-emerald-300 hover:text-emerald-800">
            {paused ? "Play clip" : "Pause clip"}
          </button>
          <Link href={"/studio/ads?record=1&scene=" + (activeScene + 1)} className="button-primary px-4 py-2.5 text-sm">Record mode →</Link>
        </div>
      </div>

      <div className="grid gap-7 p-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-8">
        <div className="flex justify-center rounded-[1.75rem] bg-[radial-gradient(circle_at_50%_0%,#d1fae5,transparent_45%),linear-gradient(145deg,#effcf6,#f8fafc)] p-5 sm:p-9">
          <div className="relative w-full max-w-[350px] overflow-hidden rounded-[2.35rem] border-[7px] border-slate-950 bg-slate-950 shadow-2xl shadow-slate-950/30">
            <div className="absolute left-1/2 top-3 z-30 h-5 w-28 -translate-x-1/2 rounded-full bg-slate-950" />
            <div className="aspect-[9/16] overflow-hidden rounded-[1.85rem]">
              <AdScene index={activeScene} paused={paused} />
            </div>
          </div>
        </div>

        <aside className="flex flex-col justify-center">
          <p className="text-xs font-black uppercase tracking-[.18em] text-slate-500">Choose your clips</p>
          <div className="mt-3 space-y-2">
            {AD_SCENES.map((item, index) => <button key={item.title} type="button" onClick={() => setActiveScene(index)} className={"w-full rounded-2xl border p-4 text-left transition " + (index === activeScene ? "border-emerald-300 bg-emerald-50 shadow-sm" : "border-slate-200 bg-white hover:border-emerald-200")}>
              <span className="text-xs font-black text-emerald-700">{String(index + 1).padStart(2, "0")}</span>
              <span className="mt-1 block font-black text-slate-950">{item.title}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">{item.caption}</span>
            </button>)}
          </div>
          <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-sm leading-6 text-slate-300">
            <p className="font-black text-white">How to edit these</p>
            <p className="mt-2">Open <span className="font-black text-white">Record mode</span> to fill the screen with the selected clip, then screen-record 5–7 seconds (a 1080×1920 browser window gives a native TikTok frame). In CapCut, cut to the beat, add one fast zoom per clip, and use your real Vennet screen recording as the final reveal.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
