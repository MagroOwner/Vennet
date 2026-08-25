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

  useEffect(() => {
    setVisible(!document.cookie.split("; ").some((cookie) => cookie.startsWith(`${CONSENT_COOKIE}=`)));
  }, []);

  if (!visible) return null;

  return (
    <section
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-2xl rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-2xl shadow-slate-950/30 sm:bottom-6 sm:p-6"
      aria-label="Cookie preferences"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-lg">
          <h2 className="text-base font-extrabold text-white">Cookies help keep Vennet secure and convenient</h2>
          <p className="mt-1.5 text-sm leading-6 text-slate-300">
            We use essential cookies to secure your account and remember your sign-in for up to 30 days. With your permission, we also remember your site preferences on this browser.
            <Link href="/terms" className="ml-1 font-semibold text-emerald-300 underline decoration-emerald-400/60 underline-offset-2 hover:text-emerald-200">Learn more</Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => { saveConsent("essential"); setVisible(false); }}
            className="rounded-lg border border-slate-600 px-3.5 py-2 text-sm font-bold text-slate-100 transition hover:border-slate-400 hover:bg-slate-800"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => { saveConsent("accepted"); setVisible(false); }}
            className="button-primary px-4 py-2 text-sm"
          >
            Accept cookies
          </button>
        </div>
      </div>
    </section>
  );
}
