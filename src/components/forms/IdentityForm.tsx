"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createIdentity, updateIdentity } from "@/lib/actions/identity";

export function IdentityForm({
  mode,
  defaultName = "",
  defaultBio = "",
  defaultAvatarUrl = "",
}: {
  mode: "create" | "update";
  defaultName?: string;
  defaultBio?: string;
  defaultAvatarUrl?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [bio, setBio] = useState(defaultBio);
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatarUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setBusy(true);
    try {
      const payload = {
        name,
        bio,
        avatarUrl: avatarUrl.trim() === "" ? undefined : avatarUrl.trim(),
      };
      const result =
        mode === "create" ? await createIdentity(payload) : await updateIdentity(payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <input
        required
        placeholder="Display name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
      />
      <textarea
        rows={4}
        placeholder="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
      />
      <input
        type="url"
        placeholder="Avatar URL (optional)"
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
        className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      {saved && <p className="text-sm text-emerald-400">Saved.</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded bg-emerald-600 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50"
      >
        {mode === "create" ? "Create identity" : "Save changes"}
      </button>
    </form>
  );
}
