import Link from "next/link";
import { getUnreadNotifications } from "@/lib/queries";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const { userId } = await requireSession("/notifications");
  const notifications = await getUnreadNotifications(userId);
  return <main className="mx-auto max-w-3xl space-y-7 pb-12"><section className="relative overflow-hidden rounded-3xl bg-slate-950 px-7 py-9 text-white shadow-2xl shadow-slate-900/15"><div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" /><div className="relative"><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-300">Stay in the loop</p><h1 className="mt-2 text-4xl font-black">Your updates</h1><p className="mt-3 text-slate-300">New releases from creators you follow, price drops on saved work, and access updates for your purchases.</p></div></section>{notifications.length ? <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">{notifications.map((notification) => <Link key={notification.id} href={notification.href || "/dashboard"} className="block border-b border-slate-100 px-6 py-5 transition last:border-0 hover:bg-emerald-50"><p className="font-black text-slate-950">{notification.title}</p>{notification.body && <p className="mt-1 text-sm leading-6 text-slate-600">{notification.body}</p>}<p className="mt-2 text-xs font-semibold text-emerald-700">{notification.createdAt.toLocaleDateString()} · Open →</p></Link>)}</section> : <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="text-xl font-black text-slate-950">Nothing new right now.</p><p className="mt-2 text-sm text-slate-600">Follow creators or save offers to receive useful updates here.</p><Link href="/marketplace" className="button-primary mt-5">Explore marketplace</Link></section>}</main>;
}