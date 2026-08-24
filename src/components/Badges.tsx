import type { ReputationLevel, VerificationStatus } from "@/lib/types";

export function VerifiedBadge({ status }: { status: VerificationStatus }) {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sky-600/20 px-2 py-0.5 text-xs font-medium text-sky-400">
        ✓ Verified
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-600/20 px-2 py-0.5 text-xs font-medium text-amber-400">
        Pending review
      </span>
    );
  }
  return null;
}

const LEVEL_COLORS: Record<ReputationLevel, string> = {
  new: "bg-zinc-600/30 text-zinc-300",
  bronze: "bg-orange-800/30 text-orange-300",
  silver: "bg-slate-500/30 text-slate-200",
  gold: "bg-yellow-600/30 text-yellow-300",
  platinum: "bg-cyan-500/30 text-cyan-200",
};

export function ReputationBadge({
  score,
  level,
}: {
  score: number;
  level: ReputationLevel;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${LEVEL_COLORS[level]}`}
    >
      {score} · {level}
    </span>
  );
}
