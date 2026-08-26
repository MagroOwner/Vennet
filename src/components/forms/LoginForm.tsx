"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { beginRegistration, completeRegistration } from "@/lib/actions/auth";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const referralCode = searchParams.get("ref") ?? "";
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signupStep, setSignupStep] = useState<"details" | "verify">("details");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function switchMode(nextMode: "signin" | "signup") {
    setMode(nextMode);
    setSignupStep("details");
    setCode("");
    setError(null);
    setNotice(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        const result = await signIn("credentials", { email, password, redirect: false });
        if (result?.error) {
          setError("Invalid email or password.");
          return;
        }
        router.push(next);
        router.refresh();
        return;
      }

      if (signupStep === "details") {
        const result = await beginRegistration({ email, password, referralCode });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setSignupStep("verify");
        setNotice("We sent a six-digit verification code to " + email + ".");
        return;
      }

      const result = await completeRegistration({ email, code });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const signedIn = await signIn("credentials", { email, password, redirect: false });
      if (signedIn?.error) {
        setError("Your account is verified. Please sign in with your email and password.");
        switchMode("signin");
        return;
      }
      router.push(next);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function resendCode() {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const result = await beginRegistration({ email, password });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNotice("A new verification code was sent to " + email + ".");
    } finally {
      setBusy(false);
    }
  }

  const verifying = mode === "signup" && signupStep === "verify";

  return (
    <div className="mx-auto max-w-md py-10 sm:py-16">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-7 shadow-[0_24px_70px_rgb(15_23_42/0.12)] backdrop-blur sm:p-9">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-semibold text-emerald-700">Welcome to Vennet</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            {mode === "signin" ? "Sign in to your account" : verifying ? "Verify your email" : "Create your account"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {mode === "signin"
              ? "Manage purchases, listings, and your creator business."
              : verifying
                ? "Enter the code we sent before we create your Vennet account."
                : "Join the marketplace built for digital creators. We will verify that you own this email address."}
          </p>
          <form onSubmit={submit} className="mt-7 space-y-4">
            {!verifying && <>
              <div><label className="mb-1.5 block text-sm font-semibold text-slate-800">Email</label><input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-zinc-900 px-3.5 py-3" /></div>
              <div><label className="mb-1.5 block text-sm font-semibold text-slate-800">Password</label><input type="password" required minLength={8} placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-zinc-900 px-3.5 py-3" /></div>
            </>}
            {verifying && <div><label className="mb-1.5 block text-sm font-semibold text-slate-800">Six-digit verification code</label><input inputMode="numeric" autoComplete="one-time-code" required maxLength={6} placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} className="w-full rounded-xl border border-slate-700 bg-zinc-900 px-3.5 py-3 text-center text-xl font-bold tracking-[0.45em]" /></div>}
            {notice && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">{notice}</p>}
            {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
            <button type="submit" disabled={busy} className="button-primary w-full disabled:opacity-50">{busy ? "Please wait…" : mode === "signin" ? "Sign in" : verifying ? "Verify and create account" : "Send verification code"}</button>
          </form>
          {verifying && <div className="mt-4 flex items-center justify-between gap-3 text-sm"><button type="button" onClick={() => setSignupStep("details")} className="font-semibold text-slate-700 hover:text-slate-950">Use a different email</button><button type="button" disabled={busy} onClick={resendCode} className="font-bold text-emerald-700 hover:text-emerald-800 disabled:opacity-50">Resend code</button></div>}
          {googleEnabled && !verifying && <button onClick={() => signIn("google", { callbackUrl: next })} className="mt-3 w-full rounded-xl border border-slate-300 bg-white py-3 font-semibold text-slate-800 transition hover:bg-slate-50">Continue with Google</button>}
          {!verifying && <p className="mt-6 text-center text-sm text-slate-600">{mode === "signin" ? "New to Vennet?" : "Already have an account?"} <button type="button" onClick={() => switchMode(mode === "signin" ? "signup" : "signin")} className="font-bold text-emerald-700 hover:text-emerald-600">{mode === "signin" ? "Create an account" : "Sign in"}</button></p>}
        </div>
      </section>
    </div>
  );
}
