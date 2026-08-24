"use client";

import { useRouter } from "next/navigation";
import { LISTING_CATEGORIES } from "@/lib/types";

export function CategoryFilter({ value }: { value: string }) {
  const router = useRouter();

  return (
    <select
      value={value}
      onChange={(event) =>
        router.push(
          event.target.value ? `/marketplace?category=${event.target.value}` : "/marketplace"
        )
      }
      className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
    >
      <option value="">All categories</option>
      {LISTING_CATEGORIES.map((category) => (
        <option key={category} value={category} className="capitalize">
          {category}
        </option>
      ))}
    </select>
  );
}
