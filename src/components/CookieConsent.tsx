"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONSENT_COOKIE = "vennet_cookie_consent";
const CONSENT_MAX_AGE = 60 * 60 * 24 * 365;

function saveConsent(choice: "accepted" | "essential") {
  document.cookie = `${CONSENT_COOKIE}=${choice}; path=/; max-age=${CONSENT_MAX_AGE}; samesite=lax`;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(!document.cookie.split("; ").some((cookie) => cookie.startsWith(`${CONSENT_COOKIE}=`))); }, []);
  if (!visible) return null;

  return <section className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-4xl rounded-2xl border border-slate-700 bg-[#10151f] px-4 py-3 shadow-2xl shadow-slate-950/30" aria-label="Cookie preferences"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-200">Vennet uses essential cookies for secure sign-in and preferences. <Link href="/privacy" className="font-bold text-emerald-300 hover:text-emerald-200">Privacy</Link></p><div className="flex shrink-0 gap-2"><button type="button" onClick={() => { saveConsent("essential"); setVisible(false); }} className="rounded-lg px-3 py-2 text-sm font-bold text-slate-200 hover:bg-white/10">Essential only</button><button type="button" onClick={() => { saveConsent("accepted"); setVisible(false); }} className="button-primary px-3 py-2 text-sm">Accept</button></div></div></section>;
}
