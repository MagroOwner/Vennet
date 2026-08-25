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
  return (
    <select value={value} onChange={(event) => router.push(event.target.value ? `/marketplace?category=${event.target.value}` : "/marketplace")} className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm">
      {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
    </select>
  );
}
