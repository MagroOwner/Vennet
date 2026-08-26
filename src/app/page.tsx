import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

const categories = [
  { icon: "✦", title: "Design", detail: "UI kits, brand systems, and creative assets", href: "/collections/design", color: "bg-rose-100 text-rose-700" },
  { icon: "▦", title: "Templates", detail: "Ready-to-use systems that save hours", href: "/collections/templates", color: "bg-blue-100 text-blue-700" },
  { icon: "♫", title: "Music & Audio", detail: "Sounds, samples, and production tools", href: "/collections/music-audio", color: "bg-violet-100 text-violet-700" },
  { icon: "</>", title: "Code", detail: "Components, scripts, and developer tools", href: "/collections/code", color: "bg-emerald-100 text-emerald-700" },
  { icon: "✳", title: "AI tools", detail: "Prompts, workflows, and creator systems", href: "/collections/ai-tools", color: "bg-amber-100 text-amber-700" },
  { icon: "◎", title: "Education", detail: "Courses, guides, and practical playbooks", href: "/collections/education", color: "bg-cyan-100 text-cyan-700" },
];

const reasons = [
  ["Instant access", "Download or get clear next steps as soon as payment is confirmed."],
  ["Made by real creators", "Browse independent products, memberships, and services."],
  ["Protected checkout", "Pay securely through Stripe, with details and support in one place."],
];

export default function HomePage() {
  return <div className="space-y-8 pb-7">
    <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-7 py-10 text-white shadow-2xl shadow-slate-950/20 sm:px-10 lg:px-14 lg:py-14">
      <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full bg-emerald-400/25 blur-3xl" />
      <div className="absolute bottom-0 right-[24%] h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="relative grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-xs font-black text-emerald-200"><span className="h-2 w-2 rounded-full bg-emerald-300" />A better marketplace for digital creators</div>
          <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[.96] tracking-[-.055em] sm:text-6xl">Find something remarkable. <span className="text-emerald-300">Make it yours.</span></h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">Discover digital tools, creative work, services, and memberships from creators who care about the details.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/marketplace" className="button-primary">Explore the marketplace <span className="ml-2">→</span></Link><Link href="/dashboard/seller" className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/[0.06] px-5 py-3 font-bold text-white transition hover:bg-white/[0.12]">Start selling</Link></div>
          <div className="mt-9 flex flex-wrap gap-x-7 gap-y-2 text-sm font-semibold text-slate-300"><span>✓ Digital-only marketplace</span><span>✓ Secure Stripe checkout</span><span>✓ Creator support</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-md rotate-[-3deg] transition duration-500 hover:rotate-0">
          <div className="rounded-[1.8rem] border border-white/15 bg-white p-5 text-slate-950 shadow-2xl shadow-emerald-500/10">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100"><BrandMark className="h-7 w-7" /></span><div><p className="font-black">Featured this week</p><p className="text-xs font-semibold text-slate-500">Creator essentials</p></div></div><span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white">TRENDING</span></div>
            <div className="mt-5 rounded-2xl bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 p-5"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-800">Build faster</p><p className="mt-2 text-3xl font-black tracking-tight">Tools that turn ideas into launches.</p><div className="mt-6 flex items-end gap-2">{[48, 72, 58, 90, 68, 100, 82].map((height, index) => <span key={index} style={{ height: height + "%" }} className="flex-1 rounded-t-lg bg-gradient-to-t from-emerald-600 to-teal-300" />)}</div></div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-slate-100 p-3"><p className="text-lg font-black">5%</p><p className="text-[10px] font-bold text-slate-500">platform fee</p></div><div className="rounded-xl bg-slate-100 p-3"><p className="text-lg font-black">24/7</p><p className="text-[10px] font-bold text-slate-500">access</p></div><div className="rounded-xl bg-slate-100 p-3"><p className="text-lg font-black">Stripe</p><p className="text-[10px] font-bold text-slate-500">payments</p></div></div>
          </div>
        </div>
      </div>
    </section>

    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/[0.04] sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-[.16em] text-emerald-700">Shop by category</p><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Explore what you need next.</h2></div><Link href="/collections" className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-black text-slate-800 transition hover:border-emerald-400 hover:text-emerald-800">View all collections →</Link></div>
      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <Link key={category.title} href={category.href} className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:bg-white hover:shadow-lg hover:shadow-emerald-950/5"><span className={"grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg font-black " + category.color}>{category.icon}</span><div><h3 className="font-black text-slate-950">{category.title}</h3><p className="mt-1 text-sm leading-5 text-slate-600">{category.detail}</p><span className="mt-2 inline-block text-xs font-black text-emerald-800">Browse {category.title} →</span></div></Link>)}</div>
    </section>

    <section className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <div className="relative overflow-hidden rounded-[2rem] bg-amber-300 p-8 text-slate-950 shadow-xl shadow-amber-900/10 sm:p-10"><div className="absolute -right-16 -top-16 grid h-64 w-64 rotate-12 place-items-center rounded-[2.5rem] border-[18px] border-amber-200/80 bg-amber-400/70 text-7xl font-black text-amber-950/60">%</div><div className="relative max-w-md"><p className="text-sm font-black uppercase tracking-[.18em] text-amber-900">For creators</p><h2 className="mt-3 text-4xl font-black leading-tight tracking-tight">Your best work deserves a better storefront.</h2><p className="mt-4 text-base font-medium leading-7 text-amber-950/80">Publish digital offers, deliver them clearly, accept secure payments, and grow when you are ready.</p><Link href="/dashboard/seller" className="mt-7 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5">Create a listing →</Link></div></div>
      <div className="rounded-[2rem] bg-emerald-900 p-8 text-white shadow-xl shadow-emerald-950/15 sm:p-10"><p className="text-sm font-black uppercase tracking-[.18em] text-emerald-200">Why Vennet</p><h2 className="mt-3 text-3xl font-black tracking-tight">A simpler way to buy digital.</h2><div className="mt-6 space-y-5">{reasons.map(([title, text]) => <div key={title} className="flex gap-3"><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-300 text-sm font-black text-emerald-950">✓</span><div><h3 className="font-black">{title}</h3><p className="mt-1 text-sm leading-6 text-emerald-100/80">{text}</p></div></div>)}</div></div>
    </section>

    <section className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-slate-200 bg-white px-7 py-6 shadow-lg shadow-slate-900/[0.04] sm:flex-row sm:items-center"><div><p className="text-lg font-black text-slate-950">Looking for something specific?</p><p className="mt-1 text-sm text-slate-600">Search the marketplace or browse the newest creator releases.</p></div><div className="flex flex-wrap gap-3"><Link href="/marketplace" className="button-primary px-4 py-2.5 text-sm">Search offers</Link><Link href="/discover" className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-black text-slate-800 transition hover:border-emerald-400">See what’s trending</Link></div></section>
  </div>;
}
