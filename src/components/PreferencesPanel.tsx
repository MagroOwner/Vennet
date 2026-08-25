"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CardSize = "small" | "medium" | "large";
type Accent = "emerald" | "lime" | "teal";
type Preferences = { cardSize: CardSize; reduceMotion: boolean; highContrast: boolean; focusMode: boolean; wideLayout: boolean; accent: Accent };

const defaults: Preferences = { cardSize: "medium", reduceMotion: false, highContrast: false, focusMode: false, wideLayout: false, accent: "emerald" };

export function applyPreferences(preferences: Preferences) {
  const root = document.documentElement;
  root.classList.toggle("reduce-motion", preferences.reduceMotion);
  root.classList.toggle("high-contrast", preferences.highContrast);
  root.classList.toggle("focus-mode", preferences.focusMode);
  root.classList.toggle("wide-layout", preferences.wideLayout);
  root.dataset.vennetAccent = preferences.accent;
}

function readPreferences(): Preferences {
  try { return { ...defaults, ...JSON.parse(window.localStorage.getItem("vennet-preferences") ?? "{}") }; } catch { return defaults; }
}

export function PreferencesPanel({ isPro }: { isPro: boolean }) {
  const [preferences, setPreferences] = useState<Preferences>(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => setPreferences(readPreferences()), []);

  function update(next: Partial<Preferences>) {
    const value = { ...preferences, ...next };
    setPreferences(value);
    applyPreferences(value);
    window.localStorage.setItem("vennet-preferences", JSON.stringify(value));
    window.localStorage.setItem("vennet-marketplace-size", value.cardSize);
    setSaved(true);
  }

  return <div className="mt-7 space-y-6">
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="font-bold text-white">Browsing</h2><p className="mt-1 text-sm text-slate-400">Control how marketplace listings appear on this device.</p></div></div><div className="mt-5"><p className="text-sm font-semibold text-slate-200">Marketplace card size</p><div className="mt-2 inline-flex rounded-xl border border-white/10 p-1">{(["small", "medium", "large"] as CardSize[]).map((size) => <button key={size} type="button" onClick={() => update({ cardSize: size })} className={preferences.cardSize === size ? "rounded-lg bg-emerald-300 px-3 py-1.5 text-sm font-bold capitalize text-slate-950" : "rounded-lg px-3 py-1.5 text-sm font-semibold capitalize text-slate-300 hover:bg-white/10"}>{size}</button>)}</div></div></section>
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><h2 className="font-bold text-white">Comfort and accessibility</h2><p className="mt-1 text-sm text-slate-400">Make Vennet easier and more comfortable to use.</p><div className="mt-5 space-y-4"><Toggle label="Reduce motion" description="Turns off decorative movement and transitions." checked={preferences.reduceMotion} onChange={(checked) => update({ reduceMotion: checked })} /><Toggle label="High readability" description="Increases overall contrast throughout Vennet." checked={preferences.highContrast} onChange={(checked) => update({ highContrast: checked })} /></div></section>
    <section className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold text-white">Vennet Pro preferences <span className="ml-1 rounded-full bg-emerald-300 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-950">Pro</span></h2><p className="mt-1 text-sm text-slate-300">Extra controls for a more focused creator workspace.</p></div>{!isPro && <Link href="/pro" className="button-primary px-3 py-2 text-sm">Unlock Pro</Link>}</div><div className="mt-5 space-y-4"><Toggle label="Focus mode" description="Reduces decorative background effects for a calmer workspace." checked={preferences.focusMode} disabled={!isPro} pro onChange={(checked) => update({ focusMode: checked })} /><Toggle label="Wide workspace" description="Uses more screen width on large displays." checked={preferences.wideLayout} disabled={!isPro} pro onChange={(checked) => update({ wideLayout: checked })} /><div><div className="flex items-center gap-2"><p className="text-sm font-semibold text-white">Accent color</p><span className="rounded-full bg-emerald-300 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-950">Pro</span></div><p className="mt-1 text-sm text-slate-400">Personalize Vennet&apos;s highlight color.</p><div className="mt-3 flex gap-2">{(["emerald", "lime", "teal"] as Accent[]).map((accent) => <button key={accent} disabled={!isPro} type="button" onClick={() => update({ accent })} className={preferences.accent === accent ? "rounded-xl border border-white bg-white/15 px-3 py-2 text-sm font-semibold capitalize text-white disabled:opacity-50" : "rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold capitalize text-slate-300 hover:bg-white/10 disabled:opacity-50"}>{accent}</button>)}</div></div></div></section>
    {saved && <p className="text-sm font-semibold text-emerald-300">Settings saved for this browser.</p>}
  </div>;
}

function Toggle({ label, description, checked, onChange, disabled = false, pro = false }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean; pro?: boolean }) {
  return <label className={disabled ? "flex items-center justify-between gap-4 opacity-55" : "flex cursor-pointer items-center justify-between gap-4"}><span><span className="text-sm font-semibold text-white">{label}{pro && <span className="ml-2 rounded-full bg-emerald-300 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-950">Pro</span>}</span><span className="mt-1 block text-sm text-slate-400">{description}</span></span><input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-emerald-300" /></label>;
}
