"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { requestPasswordReset } from "@/lib/actions/auth";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await requestPasswordReset({ email });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNotice("If that email has a Vennet account, a reset link is on its way. Check spam or junk mail too.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="mx-auto max-w-md py-10 sm:py-16">
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-7 shadow-[0_24px_70px_rgb(15_23_42/0.12)] backdrop-blur sm:p-9">
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-300/25 blur-3xl" />
      <div className="relative">
        <p className="text-sm font-semibold text-emerald-700">Vennet account recovery</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Reset your password</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Enter your account email and we’ll send a secure reset link that expires in 15 minutes.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <div><label className="mb-1.5 block text-sm font-semibold text-slate-800">Account email</label><input type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-zinc-900 px-3.5 py-3" /></div>
          {notice && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">{notice}</p>}
          {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
          <button type="submit" disabled={busy} className="button-primary w-full disabled:opacity-50">{busy ? "Sending reset link…" : "Email me a reset link"}</button>
        </form>
        <Link href="/login" className="mt-6 inline-block text-sm font-bold text-emerald-700 hover:text-emerald-600">← Back to sign in</Link>
      </div>
    </section>
  </div>;
}
