"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect, type ReactNode } from "react";
import { applyPreferences } from "@/components/PreferencesPanel";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("vennet-preferences") ?? "{}");
      applyPreferences({ cardSize: "medium", reduceMotion: false, highContrast: false, focusMode: false, wideLayout: false, accent: "emerald", ...saved });
    } catch {}
  }, []);
  return <SessionProvider>{children}</SessionProvider>;
}
