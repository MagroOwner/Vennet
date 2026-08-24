"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { upgradeToPro } from "@/lib/actions/identity";

export function ProUpgradeButton({ hasIdentity }: { hasIdentity: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upgrade() {
    setBusy(true);
    setError(null);
    try {
      const result = await upgradeToPro();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8">
      {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
      <button
        onClick={upgrade}
        disabled={busy || !hasIdentity}
        className="w-full rounded-lg bg-emerald-600 py-3 font-medium hover:bg-emerald-500 disabled:opacity-50"
      >
        {hasIdentity ? (busy ? "Upgrading…" : "Upgrade to Pro") : "Create an identity first"}
      </button>
    </div>
  );
}
