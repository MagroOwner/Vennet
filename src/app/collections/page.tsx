import Link from "next/link";
import { COLLECTIONS } from "@/lib/collections";

export const metadata = { title: "Collections | Vennet", description: "Explore curated digital products and creator services on Vennet." };

export default function CollectionsPage() {
  return <main className="space-y-8 pb-12">
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-7 py-10 text-white shadow-2xl shadow-slate-900/15 sm:px-10">
      <div className="absolute -right-16 top-0 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="relative max-w-2xl"><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-300">Explore with intent</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Find the right kind of useful.</h1><p className="mt-4 text-base leading-7 text-slate-300">Browse focused collections of digital work made for creators, independent teams, and people building their next thing.</p><Link href="/marketplace" className="mt-6 inline-flex rounded-xl bg-emerald-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-200">View every offer →</Link></div>
    </section>
    <section><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700">Browse by goal</p><h2 className="mt-1 text-2xl font-black text-slate-950">Collections for every kind of creator</h2></div><p className="text-sm text-slate-600">New work appears as creators publish.</p></div><div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{COLLECTIONS.map((collection, index) => <Link key={collection.slug} href={"/collections/" + collection.slug} className="group animate-rise relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ animationDelay: Math.min(index * 60, 420) + "ms" }}><div className={"h-11 w-11 rounded-2xl bg-gradient-to-br " + collection.accent + " shadow-lg"} /><h2 className="mt-7 text-xl font-black tracking-tight text-slate-950">{collection.name}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{collection.description}</p><span className="mt-5 inline-flex text-sm font-black text-emerald-800 transition group-hover:translate-x-1">Explore collection →</span></Link>)}</div></section>
    <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-7 sm:flex sm:items-center sm:justify-between"><div><p className="text-xl font-black text-slate-950">Have something worth sharing?</p><p className="mt-2 text-sm leading-6 text-slate-700">List a digital product or a service, set clear delivery details, and sell with Stripe-powered checkout.</p></div><Link href="/dashboard/seller" className="button-primary mt-5 shrink-0 sm:mt-0">Start selling</Link></section>
  </main>;
}
