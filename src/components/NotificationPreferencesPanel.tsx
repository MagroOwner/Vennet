"use client";

import { useState, useTransition } from "react";
import { updateNotificationPreferences } from "@/lib/actions/notifications";

type Preferences = { priceDrops: boolean; creatorReleases: boolean; purchaseUpdates: boolean; productUpdates: boolean };

export function NotificationPreferencesPanel({ initial }: { initial: Preferences }) {
  const [preferences, setPreferences] = useState(initial);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  function toggle(key: keyof Preferences) { setPreferences((current) => ({ ...current, [key]: !current[key] })); }
  function save() { startTransition(async () => { const result = await updateNotificationPreferences(preferences); setMessage(result.ok ? "Notification choices saved." : result.error); }); }
  return <section className="mt-6 rounded-2xl border border-white/10 bg-white/[.03] p-5"><h2 className="font-bold text-white">Marketplace notifications</h2><p className="mt-1 text-sm text-slate-400">Choose which useful Vennet updates appear in your account.</p><div className="mt-5 space-y-4">{([["priceDrops", "Saved offer price drops", "Know when a saved offer becomes more affordable."], ["creatorReleases", "Creator releases", "Updates when creators you follow publish something new."], ["purchaseUpdates", "Order and access updates", "Keep delivery and support details close."], ["productUpdates", "Product updates", "Know when a purchased digital product receives new access details."]] as Array<[keyof Preferences, string, string]>).map(([key, label, description]) => <label key={key} className="flex cursor-pointer items-center justify-between gap-4"><span><span className="text-sm font-semibold text-white">{label}</span><span className="mt-1 block text-sm text-slate-400">{description}</span></span><input type="checkbox" checked={preferences[key]} onChange={() => toggle(key)} className="h-5 w-5 accent-emerald-300" /></label>)}</div><button type="button" disabled={pending} onClick={save} className="button-primary mt-5 px-4 py-2 text-sm disabled:opacity-50">{pending ? "Saving…" : "Save notification choices"}</button>{message && <p className="mt-3 text-sm font-bold text-emerald-300">{message}</p>}</section>;
}
