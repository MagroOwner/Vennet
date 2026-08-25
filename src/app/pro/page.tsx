import { BrandMark } from "@/components/BrandMark";
import { ProUpgradeButton } from "@/components/forms/ProUpgradeButton";
import { getIdentity } from "@/lib/queries";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const BENEFITS = [
  ["Priority placement", "Stand out in marketplace discovery when buyers are ready to purchase."],
  ["Advanced insights", "See clearer seller analytics to understand your listings and sales."],
  ["Pro seller identity", "Show customers that you are committed to a professional experience."],
  ["Priority support", "Get faster help when you need it most."],
];

export default async function ProPage() {
  const { userId } = await requireSession("/pro");
  const identity = await getIdentity(userId);

  return (
    <div className="relative isolate overflow-hidden rounded-[2rem] border border-emerald-400/15 bg-[#0a0e0c] px-6 py-10 shadow-2xl shadow-black/40 sm:px-10 lg:px-14 lg:py-14">
      <div className="pro-glow pro-glow-left" /><div className="pro-glow pro-glow-right" /><div className="pro-grid" />
      <div className="relative grid items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
        <section>
          <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10"><BrandMark className="h-9 w-9" /></span><span className="text-lg font-bold text-white">Vennet <span className="text-emerald-300">Pro</span></span></div>
          <p className="mt-10 inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">Built for serious sellers</p>
          <h1 className="mt-5 max-w-xl text-5xl font-black tracking-[-0.055em] text-white sm:text-6xl">Create more.<br /><span className="text-emerald-300">Grow faster.</span></h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">Vennet Pro gives digital sellers the tools, visibility, and support to turn momentum into a stronger business.</p>
          {identity?.isPro && <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-200"><span className="h-2 w-2 rounded-full bg-emerald-300" />Your Pro access is active</p>}
          <div className="max-w-md"><ProUpgradeButton hasIdentity={Boolean(identity)} isPro={Boolean(identity?.isPro)} /></div>
          <p className="mt-4 text-sm text-slate-500">Secure recurring billing through Stripe. Cancel anytime through Stripe.</p>
        </section>

        <section className="relative rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-7">
          <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="relative flex items-center justify-between border-b border-white/10 pb-5"><div className="flex items-center gap-3"><BrandMark className="h-8 w-8" /><span className="font-bold text-white">Vennet <span className="text-emerald-300">Pro</span></span></div><span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">Seller tools</span></div>
          <div className="relative mt-6 grid grid-cols-2 gap-3">
            <div className="col-span-2 rounded-2xl border border-white/10 bg-black/20 p-5"><p className="text-sm text-slate-400">Your next level</p><p className="mt-2 text-2xl font-bold text-white">Everything you need to sell with confidence.</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-4/5 rounded-full bg-gradient-to-r from-emerald-500 to-lime-300" /></div></div>
            {BENEFITS.map(([title, description], index) => <div key={title} className={index === 0 ? "col-span-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.08] p-4" : "rounded-2xl border border-white/10 bg-black/20 p-4"}><span className="text-emerald-300">✦</span><h2 className="mt-5 font-semibold text-white">{title}</h2><p className="mt-2 text-sm leading-5 text-slate-400">{description}</p></div>)}
          </div>
        </section>
      </div>
    </div>
  );
}
