import { ProUpgradeButton } from "@/components/forms/ProUpgradeButton";
import { getIdentity } from "@/lib/queries";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const BENEFITS = [
  "Pro badge on your identity and listings",
  "Priority placement in marketplace search",
  "Advanced seller analytics",
  "Priority dispute review",
];

export default async function ProPage() {
  const { userId } = await requireSession("/pro");
  const identity = await getIdentity(userId);

  return (
    <div className="mx-auto max-w-lg text-center">
      <h1 className="text-3xl font-bold">Vennet Pro</h1>
      <p className="mt-2 text-zinc-400">Monthly membership with secure Stripe billing. Your Pro status stays active while payments are current.</p>
      <ul className="mt-6 space-y-2 text-left text-zinc-300">
        {BENEFITS.map((benefit) => (
          <li key={benefit}>• {benefit}</li>
        ))}
      </ul>
      {identity?.isPro && <p className="mt-8 font-medium text-emerald-400">Your Vennet Pro access is currently active.</p>}
      <ProUpgradeButton hasIdentity={Boolean(identity)} isPro={Boolean(identity?.isPro)} />
    </div>
  );
}
