"use client";

type Offer = { id: string; title: string; priceCents: number; currency: string; category: string; imageUrl?: string };

export function CompareButton({ offer }: { offer: Offer }) {
  function add() {
    const key = "vennet-compare";
    const current = JSON.parse(window.localStorage.getItem(key) ?? "[]") as Offer[];
    const next = [offer, ...current.filter((item) => item.id !== offer.id)].slice(0, 3);
    window.localStorage.setItem(key, JSON.stringify(next));
  }
  return <button type="button" onClick={add} className="text-xs font-bold text-slate-400 hover:text-emerald-200">Compare</button>;
}
