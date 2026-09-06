import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return <Suspense fallback={<p className="py-12 text-center text-slate-500">Loading password reset…</p>}><ResetPasswordForm /></Suspense>;
}
