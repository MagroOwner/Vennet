import { VerifiedBadge } from "@/components/Badges";
import { VerificationForm } from "@/components/forms/VerificationForm";
import { getIdentity, getMyVerificationRequests } from "@/lib/queries";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function VerificationPage() {
  const { userId } = await requireSession("/verification");
  const [identity, requests] = await Promise.all([
    getIdentity(userId),
    getMyVerificationRequests(userId),
  ]);
  const hasPending = requests.some((request) => request.status === "pending");

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold">Verification center</h1>
      {identity && (
        <div className="mt-4">
          <VerifiedBadge status={identity.verificationStatus} />
        </div>
      )}

      {!identity ? (
        <p className="mt-6 text-zinc-400">Create your identity before verifying it.</p>
      ) : identity.verificationStatus === "verified" ? (
        <p className="mt-6 text-emerald-400">Your identity is verified.</p>
      ) : hasPending ? (
        <p className="mt-6 text-amber-400">
          Your verification request is pending review.
        </p>
      ) : (
        <VerificationForm />
      )}

      <h2 className="mt-8 text-xl font-semibold">Requests</h2>
      {requests.length === 0 ? (
        <p className="mt-4 text-zinc-400">No verification requests yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-800 rounded-lg border border-zinc-800">
          {requests.map((request) => (
            <li
              key={request.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium capitalize">
                  {request.documentType.replace(/_/g, " ")}
                </p>
                <p className="text-xs text-zinc-500">
                  {request.createdAt.toLocaleDateString()}
                  {request.reviewNote ? ` · ${request.reviewNote}` : ""}
                </p>
              </div>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs capitalize text-zinc-300">
                {request.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
