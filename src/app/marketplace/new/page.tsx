import Link from "next/link";
import { NewListingForm } from "@/components/forms/NewListingForm";
import { getIdentity, getStripeAccount } from "@/lib/queries";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const { userId } = await requireSession("/marketplace/new");
  const [identity, stripeAccount] = await Promise.all([getIdentity(userId), getStripeAccount(userId)]);

  if (!identity) {
    return <p className="mx-auto max-w-xl text-center text-slate-400">Set up your Vennet profile from your dashboard before selling.</p>;
  }

  if (!stripeAccount?.chargesEnabled || !stripeAccount.payoutsEnabled) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-amber-400/25 bg-amber-400/10 p-7">
        <p className="text-sm font-semibold text-amber-200">Stripe payout setup required</p>
        <h1 className="mt-2 text-3xl font-black text-white">Connect Stripe before creating a listing</h1>
        <p className="mt-3 leading-6 text-amber-50/75">To sell on Vennet, you need a verified Stripe account that can accept payments and receive payouts. This keeps every marketplace sale protected for buyers and sellers.</p>
        <Link href="/stripe/onboarding" className="button-primary mt-6">Connect Stripe</Link>
      </div>
    );
  }

  return <div className="mx-auto max-w-xl"><h1 className="text-3xl font-bold">Create a listing</h1><p className="mt-2 text-slate-400">Add a digital product, service, or subscription for sale.</p><NewListingForm /></div>;
}
