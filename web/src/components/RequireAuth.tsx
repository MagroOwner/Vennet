"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export function RequireAuth({
  children,
  adminOnly = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
}) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (adminOnly && role !== "admin" && role !== "moderator") {
      router.replace("/");
    }
  }, [user, role, loading, adminOnly, router]);

  if (loading || !user || (adminOnly && role !== "admin" && role !== "moderator")) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-zinc-400">
        Loading…
      </div>
    );
  }
  return <>{children}</>;
}
