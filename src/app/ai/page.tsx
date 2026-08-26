import Link from "next/link";
import { CreatorAiChat } from "@/components/CreatorAiChat";
import { getIdentity } from "@/lib/queries";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AiPage() {
  const { userId } = await requireSession("/ai");
  const identity = await getIdentity(userId);

  if (!identity?.isPro) {
    return <main className="mx-auto max-w-3xl pb-12">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-7 py-10 text-white shadow-2xl shadow-emerald-950/20 sm:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(52,211,153,.27),transparent_35%)]" />
        <div className="relative">
          <p className="text-xs font-black uppercase tracking-[.22em] text-emerald-300">Vennet Pro tool</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Your AI creator assistant.</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">Use AI to turn rough ideas into stronger listings, clearer descriptions, launch plans, and customer-friendly answers.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">{["Write better listings", "Plan a launch", "Improve buyer replies"].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/[.06] p-4 text-sm font-bold text-white">✦ {item}</div>)}</div>
          <Link href="/settings" className="mt-8 inline-block rounded-xl bg-emerald-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-200">Upgrade to Vennet Pro →</Link>
        </div>
      </section>
    </main>;
  }

  return <main className="mx-auto max-w-5xl pb-12">
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-7 py-8 text-white shadow-2xl shadow-emerald-950/20 sm:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_0%,rgba(52,211,153,.3),transparent_35%)]" />
      <div className="relative"><p className="text-xs font-black uppercase tracking-[.22em] text-emerald-300">Vennet Pro · AI assistant</p><h1 className="mt-2 text-4xl font-black tracking-tight">Make every offer sharper.</h1><p className="mt-3 max-w-2xl text-slate-300">Brainstorm, draft, and refine your digital marketplace work without leaving Vennet.</p></div>
    </section>
    <CreatorAiChat creatorName={identity.name} />
  </main>;
}
