import { Suspense } from "react";
import { LoginForm } from "@/components/forms/LoginForm";

export default function SignupPage() {
  return <Suspense fallback={<p className="text-center text-slate-500">Loading…</p>}><LoginForm googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID)} initialMode="signup" /></Suspense>;
}
