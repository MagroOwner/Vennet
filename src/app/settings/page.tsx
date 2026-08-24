import Link from "next/link";
import { IdentityForm } from "@/components/forms/IdentityForm";
import { getIdentity } from "@/lib/queries";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { userId, email } = await requireSession("/settings");
  const identity = await getIdentity(userId);

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="mt-2 text-sm text-zinc-400">Signed in as {email}</p>

      {identity ? (
        <IdentityForm
          mode="update"
          defaultName={identity.name}
          defaultBio={identity.bio}
          defaultAvatarUrl={identity.avatarUrl ?? ""}
        />
      ) : (
        <p className="mt-6 text-zinc-400">
          Create your identity from the{" "}
          <Link href="/dashboard" className="text-emerald-400 hover:underline">
            dashboard
          </Link>
          .
        </p>
      )}
    </div>
  );
}
