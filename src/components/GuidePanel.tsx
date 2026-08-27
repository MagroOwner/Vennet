"use client";

import { useEffect, useState } from "react";

export const guides = [
  { id: "buy", number: "01", title: "Buy a digital item", summary: "Find an offer, review what you receive, and pay through Stripe.", steps: ["Open Explore and choose a category or use marketplace filters.", "Read the delivery, license, compatibility, and support details.", "Use Buy now or add compatible offers to your cart.", "After payment, open My library for files, access instructions, and seller support."] },
  { id: "seller", number: "02", title: "Set up your seller account", summary: "Connect Stripe before creating your first digital offer.", steps: ["Open Seller tools in the header.", "Choose Payout setup and complete Stripe onboarding.", "Return to Seller tools and select Create a listing.", "Add complete delivery and support information before publishing."] },
  { id: "listing", number: "03", title: "Create a great listing", summary: "Help buyers understand exactly what they are getting.", steps: ["Add a clear title, description, category, and price.", "Upload the digital file or provide accurate access instructions.", "Include license terms, compatibility, update policy, and support expectations.", "Add a preview image or demo, then publish when ready."] },
  { id: "library", number: "04", title: "Find a past purchase", summary: "Everything you own lives in one organized library.", steps: ["Choose My library from the top navigation.", "Open the purchase you need.", "Download the file or follow the access instructions.", "Use the purchase support area if you need help from the seller."] },
] as const;

type Guide = typeof guides[number];
type Progress = Record<string, boolean[]>;

const ACTIVE_KEY = "vennet-active-guide";
const PROGRESS_KEY = "vennet-guide-progress";

function readProgress(): Progress {
  try { return JSON.parse(window.localStorage.getItem(PROGRESS_KEY) ?? "{}") as Progress; } catch { return {}; }
}

export function openGuide(guideId: string) {
  window.localStorage.setItem(ACTIVE_KEY, guideId);
  window.dispatchEvent(new CustomEvent("vennet-guide-change", { detail: { guideId } }));
}

export function GuidePanel() {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [progress, setProgress] = useState<Progress>({});

  useEffect(() => {
    const current = window.localStorage.getItem(ACTIVE_KEY);
    if (current) setGuide(guides.find((item) => item.id === current) ?? null);
    setProgress(readProgress());
    const handleChange = (event: Event) => {
      const guideId = (event as CustomEvent<{ guideId: string }>).detail?.guideId;
      setGuide(guides.find((item) => item.id === guideId) ?? null);
      setProgress(readProgress());
    };
    window.addEventListener("vennet-guide-change", handleChange);
    return () => window.removeEventListener("vennet-guide-change", handleChange);
  }, []);

  function close() {
    window.localStorage.removeItem(ACTIVE_KEY);
    setGuide(null);
  }

  function toggleStep(index: number) {
    if (!guide) return;
    const updated = { ...progress, [guide.id]: [...(progress[guide.id] ?? Array(guide.steps.length).fill(false))] };
    updated[guide.id][index] = !updated[guide.id][index];
    setProgress(updated);
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
  }

  if (!guide) return null;
  const complete = progress[guide.id] ?? Array(guide.steps.length).fill(false);
  const doneCount = complete.filter(Boolean).length;

  return <aside aria-label="Active guide" className="fixed bottom-4 right-4 z-40 w-[calc(100vw-2rem)] max-w-sm rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/20 sm:bottom-6 sm:right-6">
    <div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-black uppercase tracking-[.16em] text-emerald-700">Active guide · {doneCount}/{guide.steps.length}</p><h2 className="mt-1 text-lg font-black text-slate-950">{guide.title}</h2></div><button type="button" onClick={close} aria-label="Close guide" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-lg font-black text-slate-500 hover:bg-slate-50">×</button></div>
    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: (doneCount / guide.steps.length) * 100 + "%" }} /></div>
    <ol className="mt-4 space-y-2">{guide.steps.map((step, index) => <li key={step}><button type="button" onClick={() => toggleStep(index)} className="flex w-full items-start gap-3 rounded-xl p-2 text-left transition hover:bg-emerald-50"><span className={"mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-xs font-black " + (complete[index] ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-slate-400")}>{complete[index] ? "✓" : index + 1}</span><span className={"text-sm leading-5 " + (complete[index] ? "text-slate-400 line-through" : "text-slate-700")}>{step}</span></button></li>)}</ol>
    <p className="mt-3 text-xs text-slate-500">Click a step after you complete it. Your progress is saved in this browser.</p>
  </aside>;
}
