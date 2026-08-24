import { Suspense } from "react";
import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-center text-zinc-400">Loading…</p>}>
      <LoginForm googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID)} />
    </Suspense>
  );
}
