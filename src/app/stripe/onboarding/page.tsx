import { StripeOnboardButton } from "@/components/forms/StripeOnboardButton";
import { getStripeAccount } from "@/lib/queries";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function StripeOnboardingPage() {
  const { userId } = await requireSession("/stripe/onboarding");
  const account = await getStripeAccount(userId);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-3xl font-bold">Stripe onboarding</h1>
      <p className="mt-2 text-zinc-400">
        Connect a Stripe account to receive payouts from Vennet sales. Vennet keeps a 5%
        platform fee on each sale.
      </p>

      {account && (
        <dl className="mt-6 space-y-2 rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-400">Account</dt>
            <dd className="font-mono text-xs">{account.stripeAccountId}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-400">Onboarding</dt>
            <dd>{account.onboardingComplete ? "Complete" : "Incomplete"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-400">Charges enabled</dt>
            <dd>{account.chargesEnabled ? "Yes" : "No"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-400">Payouts enabled</dt>
            <dd>{account.payoutsEnabled ? "Yes" : "No"}</dd>
          </div>
        </dl>
      )}

      <StripeOnboardButton existing={Boolean(account)} />
    </div>
  );
}
