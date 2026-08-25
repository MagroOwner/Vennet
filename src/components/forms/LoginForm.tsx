"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { registerUser } from "@/lib/actions/auth";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(null); setBusy(true);
    try {
      if (mode === "signup") { const result = await registerUser({ email, password }); if (!result.ok) { setError(result.error); return; } }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) { setError("Invalid email or password."); return; }
      router.push(next); router.refresh();
    } finally { setBusy(false); }
  }

  return <div className="mx-auto max-w-md py-10 sm:py-16"><section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-7 shadow-[0_24px_70px_rgb(15_23_42/0.12)] backdrop-blur sm:p-9"><div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-300/25 blur-3xl" /><div className="relative"><p className="text-sm font-semibold text-emerald-700">Welcome to Vennet</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{mode === "signin" ? "Sign in to your account" : "Create your account"}</h1><p className="mt-3 text-sm leading-6 text-slate-600">{mode === "signin" ? "Manage purchases, listings, and your creator business." : "Join the marketplace built for digital creators."}</p>
    <form onSubmit={submit} className="mt-7 space-y-4"><div><label className="mb-1.5 block text-sm font-semibold text-slate-800">Email</label><input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-zinc-900 px-3.5 py-3" /></div><div><label className="mb-1.5 block text-sm font-semibold text-slate-800">Password</label><input type="password" required minLength={8} placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-zinc-900 px-3.5 py-3" /></div>{error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}<button type="submit" disabled={busy} className="button-primary w-full disabled:opacity-50">{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button></form>
    {googleEnabled && <button onClick={() => signIn("google", { callbackUrl: next })} className="mt-3 w-full rounded-xl border border-slate-300 bg-white py-3 font-semibold text-slate-800 transition hover:bg-slate-50">Continue with Google</button>}
    <p className="mt-6 text-center text-sm text-slate-600">{mode === "signin" ? "New to Vennet?" : "Already have an account?"} <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="font-bold text-emerald-700 hover:text-emerald-600">{mode === "signin" ? "Create an account" : "Sign in"}</button></p>
  </div></section></div>;
}
