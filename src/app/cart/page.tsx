import Link from "next/link";
import { CartCheckout } from "@/components/CartCheckout";
import { getCartListings } from "@/lib/queries";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const { userId } = await requireSession("/cart");
  const listings = await getCartListings(userId);
  return <main className="mx-auto max-w-5xl space-y-7 pb-12"><section className="relative overflow-hidden rounded-3xl bg-slate-950 px-7 py-9 text-white shadow-2xl shadow-slate-900/15"><div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" /><div className="relative"><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-300">Ready when you are</p><h1 className="mt-2 text-4xl font-black">Your cart</h1><p className="mt-3 text-slate-300">Group offers from one creator for a single secure checkout. Digital access appears in your Vennet library after payment.</p></div></section>{listings.length ? <CartCheckout listings={listings} /> : <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="text-xl font-black text-slate-950">Your cart is waiting for something useful.</p><Link href="/marketplace" className="button-primary mt-5">Explore marketplace</Link></section>}</main>;
}