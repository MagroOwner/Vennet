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
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const result = await registerUser({ email, password });
        if (!result.ok) {
          setError(result.error);
          return;
        }
      }
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signInResult?.error) {
        setError("Invalid email or password.");
        return;
      }
      router.push(next);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-12">
      <h1 className="text-2xl font-bold">
        {mode === "signin" ? "Sign in to Vennet" : "Create your Vennet account"}
      </h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded bg-emerald-600 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50"
        >
          {mode === "signin" ? "Sign in" : "Sign up"}
        </button>
      </form>
      {googleEnabled && (
        <button
          onClick={() => signIn("google", { callbackUrl: next })}
          className="mt-3 w-full rounded border border-zinc-700 py-2 hover:bg-zinc-800"
        >
          Continue with Google
        </button>
      )}
      <button
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-4 w-full text-sm text-zinc-400 hover:text-zinc-200"
      >
        {mode === "signin" ? "No account? Sign up" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
