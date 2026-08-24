import { DisputeForm } from "@/components/forms/DisputeForm";
import { getMyDisputes, getPurchases } from "@/lib/queries";
import { requireSession } from "@/lib/session";
import { formatPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DisputesPage() {
  const { userId } = await requireSession("/disputes");
  const [myDisputes, purchases] = await Promise.all([
    getMyDisputes(userId),
    getPurchases(userId),
  ]);

  const disputedTransactionIds = new Set(myDisputes.map((d) => d.transactionId));
  const disputable = purchases.filter(
    (transaction) =>
      (transaction.status === "paid" || transaction.status === "disputed") &&
      !disputedTransactionIds.has(transaction.id)
  );

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">Dispute center</h1>

      <h2 className="mt-8 text-xl font-semibold">Open a dispute</h2>
      {disputable.length === 0 ? (
        <p className="mt-4 text-zinc-400">
          You have no purchases eligible for a dispute.
        </p>
      ) : (
        <DisputeForm
          transactions={disputable.map((transaction) => ({
            id: transaction.id,
            label: `${formatPrice(transaction.amountCents, transaction.currency)} · ${transaction.createdAt.toLocaleDateString()}`,
          }))}
        />
      )}

      <h2 className="mt-8 text-xl font-semibold">Your disputes</h2>
      {myDisputes.length === 0 ? (
        <p className="mt-4 text-zinc-400">No disputes.</p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-800 rounded-lg border border-zinc-800">
          {myDisputes.map((dispute) => (
            <li key={dispute.id} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {dispute.buyerId === userId ? "Filed by you" : "Filed against you"}
                </p>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs capitalize text-zinc-300">
                  {dispute.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-400">{dispute.reason}</p>
              {dispute.resolution && (
                <p className="mt-1 text-xs text-emerald-400">
                  Resolution: {dispute.resolution}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
