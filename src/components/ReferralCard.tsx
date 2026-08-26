"use client";

import { useState } from "react";
import { createReferralCode } from "@/lib/actions/community";

export function ReferralCard({ initialCode, signUps = 0, qualified = 0, rewardCents = 0 }: { initialCode?: string | null; signUps?: number; qualified?: number; rewardCents?: number }) {
  const [code, setCode] = useState(initialCode ?? "");
  const [notice, setNotice] = useState("");

  async function createCode() {
    const result = await createReferralCode();
    if (!result.ok) {
      setNotice(result.error);
      return;
    }
    setCode(result.code);
    setNotice("Your referral link is ready to share.");
  }

  async function copyLink() {
    if (!code) return;
    const link = window.location.origin + "/login?ref=" + encodeURIComponent(code);
    await navigator.clipboard.writeText(link);
    setNotice("Referral link copied.");
  }

  return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">Creator referrals</p><h3 className="mt-2 text-lg font-black text-white">Grow with people who trust you.</h3><p className="mt-2 text-sm leading-6 text-slate-300">Share your creator link. Sign-ups and first verified purchases are tracked automatically.</p><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-slate-950 p-2"><p className="text-lg font-black text-emerald-200">{signUps}</p><p className="text-[10px] font-bold text-slate-400">sign-ups</p></div><div className="rounded-xl bg-slate-950 p-2"><p className="text-lg font-black text-emerald-200">{qualified}</p><p className="text-[10px] font-bold text-slate-400">qualified</p></div><div className="rounded-xl bg-slate-950 p-2"><p className="text-lg font-black text-emerald-200">${(rewardCents / 100).toFixed(0)}</p><p className="text-[10px] font-bold text-slate-400">credits</p></div></div>{code ? <><div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950 px-3 py-2"><span className="truncate font-mono text-sm font-bold text-emerald-200">{code}</span><button type="button" onClick={copyLink} className="rounded-lg bg-emerald-300 px-3 py-1.5 text-xs font-black text-slate-950">Copy link</button></div></> : <button type="button" onClick={createCode} className="mt-4 rounded-xl border border-emerald-300/30 bg-emerald-300 px-4 py-2.5 text-sm font-black text-slate-950 transition hover:bg-emerald-200">Create my referral link</button>}{notice && <p className="mt-3 text-xs font-semibold text-emerald-200">{notice}</p>}</div>;
}
