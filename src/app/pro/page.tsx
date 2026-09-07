import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { ProUpgradeButton } from "@/components/forms/ProUpgradeButton";
import { auth } from "@/lib/auth";
import { getIdentity } from "@/lib/queries";

export const dynamic = "force-dynamic";

const BENEFITS = [
  ["Priority placement", "Stand out in marketplace discovery when buyers are ready to purchase."],
  ["Advanced insights", "See clearer seller analytics to understand listings and sales."],
  ["Pro seller identity", "Show customers that you are committed to a professional experience."],
  ["Priority support", "Get faster help when you need it most."],
];

export default async function ProPage() {
  const session = await auth();
  const identity = session?.user?.id ? await getIdentity(session.user.id) : null;

  return <div className="space-y-12 pb-10">
    <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#10151f] px-6 py-12 shadow-[0_24px_60px_rgb(16_21_31/.2)] sm:px-10 lg:px-14 lg:py-16">
      <div className="pro-glow pro-glow-left" /><div className="pro-glow pro-glow-right" /><div className="pro-grid" />
      <div className="relative grid items-center gap-12 lg:grid-cols-[1fr_.9fr]">
        <div><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10"><BrandMark className="h-9 w-9" /></span><span className="text-lg font-bold text-white">Vennet <span className="text-emerald-300">Pro</span></span></div><p className="mt-10 inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[.16em] text-emerald-200">Built for serious sellers</p><h1 className="mt-5 max-w-xl text-5xl font-black tracking-[-.055em] text-white sm:text-6xl">Build a storefront buyers <span className="text-emerald-300">remember.</span></h1><p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">Vennet Pro gives digital sellers more visibility, clearer insights, and tools to turn momentum into a stronger business.</p>{identity?.isPro ? <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-200"><span className="h-2 w-2 rounded-full bg-emerald-300" />Your Pro access is active</p> : null}<div className="mt-8 max-w-md">{session ? <ProUpgradeButton hasIdentity={Boolean(identity)} isPro={Boolean(identity?.isPro)} /> : <Link href="/signup?next=/pro" className="button-primary w-full">Join free to explore Pro <span className="ml-2">→</span></Link>}</div><p className="mt-4 text-sm text-slate-400">Secure recurring billing through Stripe. Cancel anytime through Stripe.</p></div>
        <div className="rounded-3xl border border-white/10 bg-white/[.05] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-7"><div className="flex items-center justify-between border-b border-white/10 pb-5"><div className="flex items-center gap-3"><BrandMark className="h-8 w-8" /><span className="font-bold text-white">Vennet Pro</span></div><span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200">Seller tools</span></div><div className="mt-6 grid grid-cols-2 gap-3"><div className="col-span-2 rounded-2xl border border-white/10 bg-black/20 p-5"><p className="text-sm text-slate-400">Your next level</p><p className="mt-2 text-2xl font-bold text-white">Everything you need to sell with confidence.</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-4/5 rounded-full bg-[#2fcf91]" /></div></div>{BENEFITS.map(([title, description], index) => <div key={title} className={index === 0 ? "col-span-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/[.08] p-4" : "rounded-2xl border border-white/10 bg-black/20 p-4"}><span className="text-emerald-300">✦</span><h2 className="mt-5 font-bold text-white">{title}</h2><p className="mt-2 text-sm leading-5 text-slate-400">{description}</p></div>)}</div></div>
      </div>
    </section>
    <section className="surface-card p-7 sm:p-10"><p className="eyebrow">Plans at a glance</p><h2 className="mt-2 text-3xl font-black tracking-[-.04em] text-[#10151f]">Start free. Upgrade when your work needs more reach.</h2><div className="mt-7 grid gap-5 md:grid-cols-2"><div className="rounded-2xl border border-slate-200 p-6"><p className="text-lg font-black">Free</p><p className="mt-2 text-sm text-slate-600">Create listings, sell digital work, and manage deliveries.</p></div><div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6"><p className="text-lg font-black text-emerald-950">Vennet Pro</p><p className="mt-2 text-sm text-emerald-900/80">Extra discovery, seller insights, professional identity, and priority support.</p></div></div></section>
  </div>;
}
