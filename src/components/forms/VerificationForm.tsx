"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitVerification } from "@/lib/actions/verification";
import { DOCUMENT_TYPES, type DocumentType } from "@/lib/types";

export function VerificationForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("passport");
  const [documentPaths, setDocumentPaths] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFiles(files: FileList) {
    setUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/uploads/verification-document", {
          method: "POST",
          body,
        });
        const payload: { pathname?: string; error?: string } = await response.json();
        if (!response.ok || !payload.pathname) {
          setError(payload.error ?? "Upload failed.");
          return;
        }
        uploaded.push(payload.pathname);
      }
      setDocumentPaths((current) => [...current, ...uploaded].slice(0, 4));
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await submitVerification({ fullName, documentType, documentPaths });
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
    <form onSubmit={submit} className="mt-6 space-y-4">
      <input
        required
        placeholder="Full legal name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
      />
      <select
        value={documentType}
        onChange={(e) => setDocumentType(e.target.value as DocumentType)}
        className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 capitalize"
      >
        {DOCUMENT_TYPES.map((type) => (
          <option key={type} value={type}>
            {type.replace(/_/g, " ")}
          </option>
        ))}
      </select>
      <div>
        <label className="block text-sm text-zinc-400">
          Documents (image or PDF, up to 4)
        </label>
        <input
          type="file"
          accept="image/*,application/pdf"
          multiple
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          className="mt-1 w-full text-sm"
        />
        {uploading && <p className="mt-1 text-sm text-zinc-400">Uploading…</p>}
        {documentPaths.length > 0 && (
          <p className="mt-1 text-sm text-emerald-400">
            {documentPaths.length} document(s) uploaded
          </p>
        )}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={busy || uploading || documentPaths.length === 0}
        className="w-full rounded bg-emerald-600 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50"
      >
        {busy ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}
