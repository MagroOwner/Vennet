import { NewListingForm } from "@/components/forms/NewListingForm";
import { getIdentity } from "@/lib/queries";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const { userId } = await requireSession("/marketplace/new");
  const identity = await getIdentity(userId);

  if (!identity) {
    return (
      <p className="text-center text-zinc-400">
        You need a Vennet identity before selling. Create one from your dashboard.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold">Create a listing</h1>
      <NewListingForm />
    </div>
  );
}
