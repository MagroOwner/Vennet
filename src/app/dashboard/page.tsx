import Link from "next/link";
import { ReputationBadge, VerifiedBadge } from "@/components/Badges";
import { IdentityForm } from "@/components/forms/IdentityForm";
import { getIdentity, getPurchases, getReputationScore } from "@/lib/queries";
import { levelForScore } from "@/lib/services/reputation";
import { requireSession } from "@/lib/session";
import { formatPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId, email } = await requireSession("/dashboard");
  const identity = await getIdentity(userId);

  if (!identity) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold">Create your Vennet identity</h1>
        <p className="mt-2 text-zinc-400">
          Your identity powers reputation, selling, and verification.
        </p>
        <IdentityForm mode="create" defaultName={email.split("@")[0] ?? ""} />
      </div>
    );
  }

  const [score, purchases] = await Promise.all([
    getReputationScore(userId),
    getPurchases(userId),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">Identity</p>
          <p className="mt-1 text-lg font-semibold">{identity.name}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <VerifiedBadge status={identity.verificationStatus} />
            {identity.isPro && (
              <span className="rounded-full bg-emerald-600/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                Pro
              </span>
            )}
          </div>
          <Link
            href="/settings"
            className="mt-4 inline-block text-sm text-emerald-400 hover:underline"
          >
            Edit identity →
          </Link>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">Reputation</p>
          <p className="mt-1 text-3xl font-bold text-emerald-400">
            {score?.score ?? identity.reputationScore}
          </p>
          <div className="mt-2">
            <ReputationBadge
              score={score?.score ?? identity.reputationScore}
              level={score?.level ?? levelForScore(identity.reputationScore)}
            />
          </div>
          <Link
            href="/reputation"
            className="mt-4 inline-block text-sm text-emerald-400 hover:underline"
          >
            View history →
          </Link>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">Verification</p>
          <p className="mt-1 text-lg font-semibold capitalize">
            {identity.verificationStatus}
          </p>
          <Link
            href="/verification"
            className="mt-4 inline-block text-sm text-emerald-400 hover:underline"
          >
            Verification center →
          </Link>
        </div>
      </div>

      <h2 className="mt-8 text-xl font-semibold">Purchases</h2>
      {purchases.length === 0 ? (
        <p className="mt-4 text-zinc-400">No purchases yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-800 rounded-lg border border-zinc-800">
          {purchases.map((transaction) => (
            <li
              key={transaction.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <Link
                  href={`/marketplace/${transaction.listingId}`}
                  className="text-sm font-medium hover:text-emerald-400"
                >
                  {formatPrice(transaction.amountCents, transaction.currency)}
                </Link>
                <p className="text-xs text-zinc-500">
                  {transaction.createdAt.toLocaleDateString()}
                </p>
              </div>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs capitalize text-zinc-300">
                {transaction.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
