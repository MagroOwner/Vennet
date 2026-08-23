"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { updateIdentity } from "@/lib/callables";

export default function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsView />
    </RequireAuth>
  );
}

function SettingsView() {
  const { user, identity, refreshIdentity } = useAuth();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (identity) {
      setName(identity.name);
      setBio(identity.bio);
    }
  }, [identity]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      await updateIdentity({ name, bio });
      await refreshIdentity();
      setMessage("Identity updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  if (!identity) {
    return (
      <p className="text-center text-zinc-400">
        Create your identity from the dashboard first.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="mt-2 text-sm text-zinc-400">Signed in as {user?.email}</p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Display name</label>
          <input
            required
            minLength={2}
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Bio</label>
          <textarea
            maxLength={500}
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
          />
        </div>
        {message && <p className="text-sm text-emerald-400">{message}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded bg-emerald-600 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
