import Link from "next/link";
import { PreferencesPanel } from "@/components/PreferencesPanel";
import { NotificationPreferencesPanel } from "@/components/NotificationPreferencesPanel";
import { getIdentity, getNotificationPreferences } from "@/lib/queries";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { userId, email } = await requireSession("/settings");
  const [identity, notificationPreferences] = await Promise.all([getIdentity(userId), getNotificationPreferences(userId)]);

  return <div className="mx-auto max-w-2xl"><section className="rounded-3xl border border-emerald-400/20 bg-slate-950 p-7 text-white"><p className="text-sm font-semibold text-emerald-300">Account controls</p><h1 className="mt-2 text-3xl font-black">Settings</h1><p className="mt-3 max-w-xl text-slate-400">Customize how Vennet looks and feels. Profile information is managed separately so your account stays organized.</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/profile" className="button-primary px-4 py-2 text-sm">Edit profile</Link><Link href="/pro" className="button-secondary px-4 py-2 text-sm">Vennet Pro</Link></div></section><section className="console-panel mt-6 p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold">Your account</h2><p className="mt-1 text-sm text-slate-400">Signed in as {email}</p></div><Link href="/stripe/onboarding" className="console-link">Payout settings →</Link></div><PreferencesPanel isPro={Boolean(identity?.isPro)} /><NotificationPreferencesPanel initial={notificationPreferences} /></section></div>;
}
