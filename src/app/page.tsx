import Link from "next/link";
import { auth } from "@/lib/auth";
import { BrandMark } from "@/components/BrandMark";
import { ListingCard } from "@/components/ListingCard";
import { getActiveListings, getListingTrust } from "@/lib/queries";

const categories = [
  { icon: "✦", title: "Design", detail: "UI kits, brand systems, and creative assets", href: "/collections/design", color: "bg-rose-50 text-rose-700" },
  { icon: "▦", title: "Templates", detail: "Ready-to-use systems that save hours", href: "/collections/templates", color: "bg-amber-50 text-amber-800" },
  { icon: "</>", title: "Code", detail: "Components, scripts, and developer tools", href: "/collections/code", color: "bg-emerald-50 text-emerald-800" },
  { icon: "⌘", title: "Bots & Automations", detail: "Discord bots, integrations, and workflows", href: "/collections/bots-automations", color: "bg-lime-50 text-lime-800" },
  { icon: "✳", title: "AI tools", detail: "Prompts, workflows, and creator systems", href: "/collections/ai-tools", color: "bg-orange-50 text-orange-800" },
  { icon: "◎", title: "Education", detail: "Courses, guides, and practical playbooks", href: "/collections/education", color: "bg-stone-100 text-stone-700" },
];

const trustItems = [
  ["Clear delivery", "Know what you receive, when you receive it, and how to get support."],
  ["Creator-led work", "Discover digital products and services from independent creators."],
  ["Secure checkout", "Pay through Stripe and keep purchase details together in your library."],
];

export default async function HomePage() {
  const session = await auth();
  const sellHref = session ? "/dashboard/seller" : "/signup?next=/dashboard/seller";
  const sellLabel = session ? "Start selling" : "Sign up to sell";
  const listings = await getActiveListings();
  const featured = [...listings].sort((a, b) => Number(b.featured) - Number(a.featured) || b.purchaseCount - a.purchaseCount).slice(0, 4);
  const trustByListing = await getListingTrust(featured);

  return <div className="space-y-14 pb-10 sm:space-y-20">
    <section className="relative overflow-hidden rounded-[2rem] bg-[#10151f] px-6 py-12 text-white shadow-[0_24px_60px_rgb(16_21_31/.18)] sm:px-10 lg:px-14 lg:py-16">
      <div className="absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="absolute bottom-[-12rem] right-[30%] h-80 w-80 rounded-full bg-amber-200/10 blur-3xl" />
      <div className="relative grid gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-white/[.06] px-3 py-1.5 text-xs font-bold text-emerald-100"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />A marketplace for useful digital work</div>
          <h1 className="mt-6 text-4xl font-black leading-[.97] tracking-[-.055em] sm:text-6xl">Find digital work that helps you <span className="text-emerald-300">move forward.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">Buy tools, templates, code, automations, and creative work from independent creators. Or turn your own work into a storefront.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/marketplace" className="button-primary">Browse marketplace <span className="ml-2">→</span></Link><Link href={sellHref} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 bg-white/[.06] px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/[.12]">{sellLabel}</Link></div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-300"><span>✓ Digital-only offers</span><span>✓ Straightforward delivery</span><span>✓ Secure payments</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-md animate-drift">
          <div className="rounded-[1.75rem] border border-white/15 bg-white p-5 text-[#10151f] shadow-2xl shadow-black/25">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50"><BrandMark className="h-7 w-7" /></span><div><p className="font-black">Built for creators</p><p className="text-xs font-medium text-slate-500">Sell work with clarity</p></div></div><span className="rounded-full bg-[#10151f] px-3 py-1 text-[10px] font-black text-white">VENNET</span></div>
            <div className="mt-5 rounded-2xl bg-[linear-gradient(135deg,#e3f8ec,#f9f1dc)] p-5"><p className="text-[11px] font-black uppercase tracking-[.16em] text-emerald-800">Make your next move</p><p className="mt-2 text-3xl font-black leading-tight tracking-[-.04em]">Useful work. Real people. One place.</p><div className="mt-6 grid grid-cols-3 gap-2"><div className="rounded-xl bg-white/80 p-3 text-center"><p className="font-black">Sell</p><p className="text-[10px] text-slate-500">your work</p></div><div className="rounded-xl bg-white/80 p-3 text-center"><p className="font-black">Find</p><p className="text-[10px] text-slate-500">tools faster</p></div><div className="rounded-xl bg-white/80 p-3 text-center"><p className="font-black">Grow</p><p className="text-[10px] text-slate-500">with clarity</p></div></div></div>
          </div>
        </div>
      </div>
    </section>

    <section className="surface-card p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Browse by category</p><h2 className="mt-2 text-3xl font-black tracking-[-.04em] text-[#10151f]">Start with what you need.</h2></div><Link href="/collections" className="button-secondary px-4 py-2.5 text-sm">All categories →</Link></div>
      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <Link key={category.title} href={category.href} className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-[#fbfcfb] p-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white hover:shadow-lg hover:shadow-slate-900/[.05]"><span className={"grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg font-black " + category.color}>{category.icon}</span><div><h3 className="font-black text-[#10151f]">{category.title}</h3><p className="mt-1 text-sm leading-5 text-slate-600">{category.detail}</p><span className="mt-2 inline-block text-xs font-black text-emerald-800">Explore →</span></div></Link>)}</div>
    </section>

    <section>
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Featured this week</p><h2 className="mt-2 text-3xl font-black tracking-[-.04em] text-[#10151f]">Worth a closer look.</h2></div><Link href="/marketplace" className="text-sm font-black text-emerald-800 transition hover:text-emerald-950">Browse all offers →</Link></div>
      {featured.length >= 3 ? <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{featured.map((listing, index) => <div key={listing.id} className="animate-rise" style={{ animationDelay: Math.min(index * 65, 260) + "ms" }}><ListingCard listing={listing} saved={false} verifiedSeller={trustByListing[listing.id]?.sellerVerified} rating={trustByListing[listing.id]?.averageRating ? { average: trustByListing[listing.id].averageRating as number, count: trustByListing[listing.id].reviewCount } : null} /></div>)}</div> : null}
    </section>

    <section className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#f7e4bd] p-8 shadow-[0_18px_38px_rgb(124_88_21/.10)] sm:p-10"><div className="absolute -right-14 -top-14 h-56 w-56 rotate-12 rounded-[2.5rem] border-[16px] border-white/35" /><div className="relative max-w-md"><p className="text-[11px] font-black uppercase tracking-[.18em] text-amber-900">For sellers</p><h2 className="mt-3 text-4xl font-black leading-tight tracking-[-.04em] text-[#10151f]">Your work deserves a storefront that feels finished.</h2><p className="mt-4 leading-7 text-amber-950/75">Publish digital offers, explain exactly what buyers receive, and keep your sales in one clear workspace.</p><Link href={sellHref} className="mt-7 inline-flex rounded-xl bg-[#10151f] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5">{session ? "Create a listing →" : "Sign up to sell →"}</Link></div></div>
      <div className="rounded-[2rem] bg-[#0e6048] p-8 text-white shadow-[0_18px_38px_rgb(14_96_72/.14)] sm:p-10"><p className="text-[11px] font-black uppercase tracking-[.18em] text-emerald-200">Why Vennet</p><h2 className="mt-3 text-3xl font-black tracking-[-.04em]">A clearer way to buy digital.</h2><div className="mt-7 space-y-5">{trustItems.map(([title, text]) => <div key={title} className="flex gap-3"><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-200 text-sm font-black text-emerald-950">✓</span><div><h3 className="font-black">{title}</h3><p className="mt-1 text-sm leading-6 text-emerald-50/80">{text}</p></div></div>)}</div></div>
    </section>
  </div>;
}