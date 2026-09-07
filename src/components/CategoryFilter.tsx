"use client";

import { useRouter } from "next/navigation";

const categories = [
  { value: "", label: "All digital offers" },
  { value: "digital", label: "Digital products" },
  { value: "services", label: "Services" },
  { value: "other", label: "Subscriptions & memberships" },
];

export function CategoryFilter({ value }: { value: string }) {
  const router = useRouter();
  return <select value={value} onChange={(event) => router.push(event.target.value ? `/marketplace?category=${event.target.value}` : "/marketplace")} className="min-h-11 rounded-xl border border-white/20 bg-white px-3 py-2 text-sm font-bold text-slate-800 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300">
    {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
  </select>;
}
