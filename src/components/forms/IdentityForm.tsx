"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createIdentity, updateIdentity } from "@/lib/actions/identity";

export function IdentityForm({ mode, defaultName = "", defaultBio = "", defaultAvatarUrl = "" }: { mode: "create" | "update"; defaultName?: string; defaultBio?: string; defaultAvatarUrl?: string }) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [bio, setBio] = useState(defaultBio);
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function uploadAvatar(file: File) {
    setUploading(true); setError(null);
    try {
      const body = new FormData(); body.append("file", file);
      const response = await fetch("/api/uploads/avatar", { method: "POST", body });
      const payload: { url?: string; error?: string } = await response.json();
      if (!response.ok || !payload.url) { setError(payload.error ?? "Profile image upload failed."); return; }
      setAvatarUrl(payload.url);
    } finally { setUploading(false); }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(null); setSaved(false); setBusy(true);
    try {
      const payload = { name, bio, avatarUrl: avatarUrl.trim() === "" ? undefined : avatarUrl.trim() };
      const result = mode === "create" ? await createIdentity(payload) : await updateIdentity(payload);
      if (!result.ok) { setError(result.error); return; }
      setSaved(true); router.refresh();
    } finally { setBusy(false); }
  }

  return <form onSubmit={submit} className="mt-6 space-y-5">
    <div><label className="mb-1 block text-sm font-semibold">Display name</label><input required placeholder="How should Vennet display your name?" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5" /></div>
    <div><label className="mb-1 block text-sm font-semibold">Bio</label><textarea rows={4} placeholder="Tell buyers and sellers a little about you." value={bio} onChange={(e) => setBio(e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5" /></div>
    <div><label className="mb-1 block text-sm font-semibold">Profile image</label><p className="mb-2 text-sm text-slate-400">Upload a JPG, PNG, or WebP image, up to 5MB.</p><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} className="w-full text-sm" />{uploading && <p className="mt-2 text-sm text-slate-400">Uploading profile image…</p>}{avatarUrl && <div className="mt-3 flex items-center gap-3"><img src={avatarUrl} alt="" className="h-14 w-14 rounded-xl object-cover" /><button type="button" onClick={() => setAvatarUrl("")} className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">Remove image</button></div>}</div>
    {error && <p className="text-sm text-red-400">{error}</p>}{saved && <p className="text-sm text-emerald-400">Profile saved.</p>}
    <button type="submit" disabled={busy || uploading} className="button-primary w-full disabled:opacity-50">{mode === "create" ? "Create profile" : busy ? "Saving…" : "Save profile"}</button>
  </form>;
}
