import type { ReputationLevel, VerificationStatus } from "@/lib/types";

export function VerifiedBadge({ status }: { status: VerificationStatus }) {
  if (status !== "verified") return null;
  return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-300 px-2.5 py-1 text-xs font-black text-emerald-950">✓ Verified seller</span>;
}

const LEVEL_COLORS: Record<ReputationLevel, string> = {
  new: "bg-slate-200 text-slate-700",
  bronze: "bg-orange-100 text-orange-800",
  silver: "bg-stone-200 text-stone-700",
  gold: "bg-amber-100 text-amber-900",
  platinum: "bg-emerald-100 text-emerald-800",
};

export function ReputationBadge({
  score,
  level,
}: {
  score: number;
  level: ReputationLevel;
}) {
  return <span className={"inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold " + LEVEL_COLORS[level]}>{score} reputation · {level}</span>;
}
