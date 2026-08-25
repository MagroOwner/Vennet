import Link from "next/link";

const features = [
  { title: "Digital products", body: "Sell downloads, templates, files, tools, and digital assets.", href: "/marketplace?category=digital" },
  { title: "Services", body: "Offer creative, technical, and professional services.", href: "/marketplace?category=services" },
  { title: "Subscriptions", body: "Build a trusted audience and manage recurring digital offers.", href: "/dashboard/seller" },
];

export default function HomePage() {
  return (
    <div className="console-page">
      <section className="py-12 text-center sm:py-20">
        <p className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">Digital marketplace for creators</p>
        <h1 className="mx-auto max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">Buy and sell digital work with confidence.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-7 text-zinc-400">Vennet is a marketplace for digital products, services, and creator subscriptions — protected by verified profiles, secure payments, and clear dispute support.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/marketplace" className="rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-zinc-950 hover:bg-emerald-400">Explore digital offers</Link>
          <Link href="/dashboard/seller" className="rounded-lg border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-900">Start selling</Link>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => <Link key={feature.title} href={feature.href} className="console-panel p-6 transition hover:border-emerald-700"><h2 className="text-xl font-bold">{feature.title}</h2><p className="mt-2 leading-6 text-zinc-400">{feature.body}</p><span className="console-link mt-5 inline-block">Explore →</span></Link>)}
      </section>
      <section className="console-panel mt-6 grid gap-6 p-6 sm:grid-cols-3"><div><p className="font-bold">Digital only</p><p className="mt-1 text-sm text-zinc-400">No shipping, inventory, or physical products.</p></div><div><p className="font-bold">Built for creators</p><p className="mt-1 text-sm text-zinc-400">List your work and receive secure payouts.</p></div><div><p className="font-bold">Buy with confidence</p><p className="mt-1 text-sm text-zinc-400">Verified profiles and a clear dispute process.</p></div></section>
    </div>
  );
}
