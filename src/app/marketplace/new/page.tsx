import Link from "next/link";
import { NewListingForm } from "@/components/forms/NewListingForm";
import { getIdentity, getStripeAccount } from "@/lib/queries";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const { userId } = await requireSession("/marketplace/new");
  const [identity, stripeAccount] = await Promise.all([getIdentity(userId), getStripeAccount(userId)]);

  if (!identity) {
    return <p className="mx-auto max-w-xl text-center text-slate-700">Set up your Vennet profile from your dashboard before selling.</p>;
  }

  const payoutsReady = Boolean(stripeAccount?.chargesEnabled && stripeAccount?.payoutsEnabled);

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)] sm:p-7">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-emerald-300">Start selling</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Build your offer first. Set up payouts when you are ready.</h1>
        <p className="mt-3 max-w-2xl leading-6 text-slate-200">You can create a complete listing now. It stays private as a draft until Stripe confirms your payout account—then you can publish it in one click.</p>
        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3"><span className="font-black text-emerald-300">1</span><p className="mt-1 font-bold">Create your offer</p></div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3"><span className="font-black text-emerald-300">2</span><p className="mt-1 font-bold">Set up payouts</p></div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3"><span className="font-black text-emerald-300">3</span><p className="mt-1 font-bold">Publish and sell</p></div>
        </div>
      </div>

      {!payoutsReady && (
        <aside className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm font-extrabold text-amber-900">Payout setup can wait</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Your listing will save as a private draft.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">When you are ready to receive sales, Stripe securely verifies the payout account directly. Vennet does not collect or store your SSN or ID images.</p>
          <Link href="/stripe/onboarding" className="button-secondary mt-4">Set up Stripe payouts</Link>
        </aside>
      )}

      {payoutsReady && (
        <aside className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-sm font-extrabold text-emerald-800">Payouts ready</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">Your listing will publish as soon as you save it.</p>
        </aside>
      )}

      <div className="mt-7">
        <h2 className="text-2xl font-black tracking-tight text-slate-950">Create your listing</h2>
        <p className="mt-1 text-slate-700">{payoutsReady ? "Add the details buyers need, then publish." : "Fill this out at your own pace. You can connect Stripe later from Seller tools."}</p>
        <NewListingForm isPro={identity.isPro} />
      </div>
    </div>
  );
}
