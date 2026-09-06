"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { resetPassword } from "@/lib/actions/auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    if (!email || !token) {
      setError("This reset link is incomplete. Request a new one.");
      return;
    }

    setBusy(true);
    try {
      const result = await resetPassword({ email, token, password });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNotice("Your password has been changed. Redirecting you to sign in…");
      window.setTimeout(() => router.push("/login"), 1200);
    } finally {
      setBusy(false);
    }
  }

  return <div className="mx-auto max-w-md py-10 sm:py-16">
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-7 shadow-[0_24px_70px_rgb(15_23_42/0.12)] backdrop-blur sm:p-9">
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-300/25 blur-3xl" />
      <div className="relative">
        <p className="text-sm font-semibold text-emerald-700">Vennet account recovery</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Choose a new password</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Use a new password with at least 8 characters.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <div><label className="mb-1.5 block text-sm font-semibold text-slate-800">New password</label><input type="password" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-zinc-900 px-3.5 py-3" /></div>
          <div><label className="mb-1.5 block text-sm font-semibold text-slate-800">Confirm new password</label><input type="password" required minLength={8} autoComplete="new-password" placeholder="Repeat your password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-zinc-900 px-3.5 py-3" /></div>
          {notice && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">{notice}</p>}
          {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
          <button type="submit" disabled={busy} className="button-primary w-full disabled:opacity-50">{busy ? "Saving new password…" : "Save new password"}</button>
        </form>
        <Link href="/forgot-password" className="mt-6 inline-block text-sm font-bold text-emerald-700 hover:text-emerald-600">Request another reset link</Link>
      </div>
    </section>
  </div>;
}
