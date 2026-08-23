"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { submitVerification } from "@/lib/callables";
import { getMyVerificationRequests, uploadVerificationDoc } from "@/lib/services";
import type { VerificationRequest } from "@/lib/types";

const DOC_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's license" },
  { value: "national_id", label: "National ID" },
] as const;

export default function VerificationPage() {
  return (
    <RequireAuth>
      <VerificationCenter />
    </RequireAuth>
  );
}

function VerificationCenter() {
  const { user, identity, refreshIdentity } = useAuth();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [fullName, setFullName] = useState("");
  const [documentType, setDocumentType] =
    useState<(typeof DOC_TYPES)[number]["value"]>("passport");
  const [files, setFiles] = useState<FileList | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getMyVerificationRequests(user.uid).then(setRequests).catch(console.error);
  }, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !files || files.length === 0) {
      setError("Please attach at least one document.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const documentPaths: string[] = [];
      for (const file of Array.from(files).slice(0, 4)) {
        documentPaths.push(await uploadVerificationDoc(user.uid, file));
      }
      await submitVerification({ fullName, documentType, documentPaths });
      setRequests(await getMyVerificationRequests(user.uid));
      await refreshIdentity();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setBusy(false);
    }
  }

  const isVerified = identity?.verificationStatus === "verified";
  const hasPending = requests.some((r) => r.status === "pending");

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold">Verification center</h1>

      {isVerified ? (
        <div className="mt-6 rounded-lg border border-sky-600/40 bg-sky-600/10 p-6">
          <p className="text-lg font-medium text-sky-300">✓ You are verified</p>
          <p className="mt-1 text-sm text-zinc-400">
            Your verified badge appears on your identity and listings.
          </p>
        </div>
      ) : hasPending ? (
        <div className="mt-6 rounded-lg border border-amber-600/40 bg-amber-600/10 p-6">
          <p className="text-amber-300">
            Your verification request is under review.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            required
            minLength={2}
            maxLength={120}
            placeholder="Full legal name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
          />
          <select
            value={documentType}
            onChange={(e) =>
              setDocumentType(e.target.value as (typeof DOC_TYPES)[number]["value"])
            }
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
          >
            {DOC_TYPES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <div>
            <label className="mb-1 block text-sm text-zinc-400">
              Documents (1-4 images or PDFs)
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="w-full text-sm text-zinc-400"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded bg-emerald-600 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50"
          >
            {busy ? "Submitting…" : "Submit for verification"}
          </button>
        </form>
      )}

      {requests.length > 0 && (
        <>
          <h2 className="mt-10 text-xl font-semibold">Request history</h2>
          <ul className="mt-4 divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900">
            {requests.map((r) => (
              <li key={r.id} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm capitalize">
                    {r.documentType.replace(/_/g, " ")}
                  </span>
                  <span
                    className={`text-sm capitalize ${
                      r.status === "approved"
                        ? "text-emerald-400"
                        : r.status === "rejected"
                          ? "text-red-400"
                          : "text-amber-400"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                {r.reviewNote && (
                  <p className="mt-1 text-xs text-zinc-500">{r.reviewNote}</p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
