import Link from "next/link";

const features = [
  { icon: "✦", title: "Digital products", body: "Templates, downloads, tools, and creative assets ready when your customers are.", href: "/marketplace?category=digital" },
  { icon: "◌", title: "Creative services", body: "Sell your skills with clear deliverables, secure payments, and trusted profiles.", href: "/marketplace?category=services" },
  { icon: "↗", title: "Creator memberships", body: "Build recurring support around the work your audience values.", href: "/dashboard/seller" },
];

export default function HomePage() {
  return <div className="overflow-hidden">
    <section className="relative py-16 sm:py-24">
      <div className="absolute left-1/2 top-6 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl animate-pulse-glow" />
      <div className="mx-auto max-w-4xl text-center">
        <p className="animate-rise inline-flex rounded-full border border-emerald-700/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-800">A better marketplace for digital creators</p>
        <h1 className="animate-rise-delay mt-7 text-5xl font-black tracking-[-0.055em] text-slate-950 sm:text-7xl">Make more from<br /><span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-700 bg-clip-text text-transparent">what you create.</span></h1>
        <p className="animate-rise-delay-2 mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-700">Vennet brings digital products, creative services, and creator memberships into one polished, trusted place to sell.</p>
        <div className="animate-rise-delay-2 mt-9 flex flex-wrap justify-center gap-3"><Link href="/marketplace" className="button-primary">Explore the marketplace <span className="ml-2">→</span></Link><Link href="/dashboard/seller" className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/70 px-5 py-3 font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-white">Start selling</Link></div>
        <div className="animate-rise-delay-2 mt-10 flex flex-wrap justify-center gap-x-7 gap-y-2 text-sm font-medium text-slate-600"><span>✓ Digital-only marketplace</span><span>✓ Secure Stripe checkout</span><span>✓ Built-in creator trust</span></div>
      </div>
    </section>
    <section className="mb-6 rounded-2xl border border-emerald-200/80 bg-white/65 p-5 shadow-sm backdrop-blur sm:flex sm:items-center sm:justify-between">
      <div><p className="text-sm font-bold text-emerald-800">Browse by craft</p><p className="mt-1 text-sm text-slate-700">Find focused digital offers from creators you can trust.</p></div>
      <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">{["Design resources", "Creator tools", "Developer assets", "Learning"].map((name) => <Link key={name} href="/marketplace?category=digital" className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-800">{name}</Link>)}</div>
    </section>
    <section className="grid gap-4 md:grid-cols-3">{features.map((feature, index) => <Link key={feature.title} href={feature.href} className={`console-panel group p-7 transition duration-300 hover:-translate-y-1 hover:border-emerald-300/30 ${index === 0 ? "animate-rise" : index === 1 ? "animate-rise-delay" : "animate-rise-delay-2"}`}><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.07] text-lg text-emerald-200 transition group-hover:scale-110 group-hover:bg-emerald-300/15">{feature.icon}</span><h2 className="mt-6 text-xl font-bold text-white">{feature.title}</h2><p className="mt-2 leading-6 text-slate-400">{feature.body}</p><span className="mt-6 inline-block text-sm font-semibold text-emerald-300">Explore <span className="transition group-hover:ml-1">→</span></span></Link>)}</section>
    <section className="console-panel mt-6 grid gap-6 overflow-hidden p-7 sm:grid-cols-[1.2fr_1fr_1fr] sm:items-center"><div><p className="text-2xl font-bold text-white">Built for selling work,<br />not managing clutter.</p><p className="mt-3 leading-6 text-slate-400">No shipping. No inventory. Just the tools you need to sell digital value.</p></div><div className="border-l-0 border-white/10 pl-0 sm:border-l sm:pl-6"><p className="text-2xl font-black text-emerald-300">5%</p><p className="mt-1 text-sm text-slate-400">simple platform fee</p></div><div className="border-l-0 border-white/10 pl-0 sm:border-l sm:pl-6"><p className="text-2xl font-black text-white">Secure</p><p className="mt-1 text-sm text-slate-400">Stripe-powered payments</p></div></section>
  </div>;
}
