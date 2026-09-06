"use client";

import { useState } from "react";

const scenes = [
  {
    eyebrow: "VENNET · DIGITAL MARKETPLACE",
    title: "Make your next move.",
    body: "Discover tools, creative work, and services made by real creators.",
    button: "Explore Vennet",
    badge: "BUILT FOR WHAT'S NEXT",
    cardTitle: "Creator essentials",
    cardBody: "Designs, templates, bots, tools & more.",
    accent: "from-emerald-300 via-teal-300 to-cyan-200",
  },
  {
    eyebrow: "SELL ON VENNET",
    title: "Your work has value.",
    body: "Turn your skills, digital products, and automations into a storefront.",
    button: "Start selling",
    badge: "CREATE · SELL · GROW",
    cardTitle: "Sell what you build",
    cardBody: "Keep your offer clear. Keep your momentum.",
    accent: "from-emerald-300 via-green-300 to-lime-200",
  },
  {
    eyebrow: "BUY FROM CREATORS",
    title: "Find work worth owning.",
    body: "Buy digital tools from independent creators and keep everything in one place.",
    button: "Find your next tool",
    badge: "MADE BY REAL CREATORS",
    cardTitle: "Your Vennet library",
    cardBody: "Saved, secure, ready when you are.",
    accent: "from-teal-200 via-emerald-300 to-green-200",
  },
] as const;

export function AdStudioPlayer() {
  const [activeScene, setActiveScene] = useState(0);
  const [paused, setPaused] = useState(false);
  const scene = scenes[activeScene];

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-emerald-950/10">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-emerald-700">Private recording studio</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Vennet Ad Studio</h1>
          <p className="mt-1 text-sm text-slate-500">Pick a scene, set it playing, and screen-record the phone frame below.</p>
        </div>
        <button type="button" onClick={() => setPaused((value) => !value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-800 transition hover:border-emerald-300 hover:text-emerald-800">
          {paused ? "Play animation" : "Pause for recording"}
        </button>
      </div>

      <div className="grid gap-7 p-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-8">
        <div className="flex justify-center rounded-[1.75rem] bg-[radial-gradient(circle_at_50%_0%,#d1fae5,transparent_45%),linear-gradient(145deg,#effcf6,#f8fafc)] p-5 sm:p-9">
          <div className="ad-phone relative w-full max-w-[350px] overflow-hidden rounded-[2.35rem] border-[7px] border-slate-950 bg-slate-950 shadow-2xl shadow-slate-950/30" style={{ "--play": paused ? "paused" : "running" } as React.CSSProperties}>
            <div className="absolute left-1/2 top-3 z-20 h-5 w-28 -translate-x-1/2 rounded-full bg-slate-950" />
            <div className="relative aspect-[9/16] overflow-hidden rounded-[1.85rem] bg-slate-950 px-6 pb-7 pt-11 text-white">
              <div className="orb orb-one" /><div className="orb orb-two" /><div className="grid-lines" />
              <div className="relative z-10 flex h-full flex-col">
                <div className="flex items-center justify-between text-[10px] font-black tracking-wide text-emerald-100/80">
                  <span className="flex items-center gap-1.5"><span className="grid h-5 w-5 place-items-center rounded-md bg-emerald-300 text-[11px] text-slate-950">V</span> vennet</span>
                  <span>01 / 03</span>
                </div>
                <div className="ad-copy mt-auto">
                  <p className="text-[10px] font-black uppercase tracking-[.18em] text-emerald-300">{scene.eyebrow}</p>
                  <h2 className="mt-3 text-[2.55rem] font-black leading-[.92] tracking-[-.065em]">{scene.title}</h2>
                  <p className="mt-4 max-w-[16rem] text-sm leading-6 text-slate-300">{scene.body}</p>
                  <button type="button" className="mt-6 rounded-xl bg-emerald-300 px-4 py-3 text-sm font-black text-slate-950 shadow-lg shadow-emerald-400/20">{scene.button} →</button>
                </div>
                <div className="ad-card mt-7 rounded-2xl border border-white/15 bg-white/[.10] p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between"><span className="text-[9px] font-black tracking-[.16em] text-emerald-200">{scene.badge}</span><span className="rounded-full bg-emerald-300 px-2 py-1 text-[8px] font-black text-slate-950">VENNET</span></div>
                  <div className={"mt-3 h-16 rounded-xl bg-gradient-to-br " + scene.accent} />
                  <h3 className="mt-3 text-base font-black">{scene.cardTitle}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-300">{scene.cardBody}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="flex flex-col justify-center">
          <p className="text-xs font-black uppercase tracking-[.18em] text-slate-500">Choose a clip</p>
          <div className="mt-3 space-y-2">
            {scenes.map((item, index) => <button key={item.title} type="button" onClick={() => setActiveScene(index)} className={"w-full rounded-2xl border p-4 text-left transition " + (index === activeScene ? "border-emerald-300 bg-emerald-50 shadow-sm" : "border-slate-200 bg-white hover:border-emerald-200")}>
              <span className="text-xs font-black text-emerald-700">0{index + 1}</span>
              <span className="mt-1 block font-black text-slate-950">{item.title}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">{item.eyebrow}</span>
            </button>)}
          </div>
          <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-sm leading-6 text-slate-300">
            <p className="font-black text-white">Recording tip</p>
            <p className="mt-2">Record each loop for 6–10 seconds. Keep the phone frame centered, then add your song and fast cuts in CapCut.</p>
          </div>
        </aside>
      </div>

      <style jsx>{`
        .orb { position: absolute; border-radius: 999px; filter: blur(5px); opacity: .6; animation: float 7s ease-in-out infinite; animation-play-state: var(--play); }
        .orb-one { width: 14rem; height: 14rem; right: -6rem; top: 3rem; background: #10b981; }
        .orb-two { width: 10rem; height: 10rem; left: -5rem; bottom: 11rem; background: #2dd4bf; animation-delay: -3s; }
        .grid-lines { position: absolute; inset: 0; opacity: .2; background-image: linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px); background-size: 32px 32px; mask-image: linear-gradient(to bottom, black, transparent 78%); }
        .ad-copy { animation: enter 7s cubic-bezier(.22,1,.36,1) infinite; animation-play-state: var(--play); }
        .ad-card { animation: card 7s cubic-bezier(.22,1,.36,1) infinite; animation-play-state: var(--play); }
        @keyframes float { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-12px,16px,0) scale(1.08); } }
        @keyframes enter { 0%,12% { opacity: 0; transform: translateY(22px); } 24%,80% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-10px); } }
        @keyframes card { 0%,28% { opacity: 0; transform: translateY(28px) scale(.96); } 42%,82% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(10px) scale(.98); } }
      `}</style>
    </section>
  );
}
