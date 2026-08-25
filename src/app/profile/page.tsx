import Link from "next/link";
import { IdentityForm } from "@/components/forms/IdentityForm";
import { getIdentity } from "@/lib/queries";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { userId, email } = await requireSession("/profile");
  const identity = await getIdentity(userId);
  return <div className="mx-auto max-w-2xl"><section className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-slate-950 p-7 text-white shadow-2xl shadow-emerald-950/20"><div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl" /><div className="relative flex items-center gap-5">{identity?.avatarUrl ? <img src={identity.avatarUrl} alt="" className="h-20 w-20 rounded-2xl border border-emerald-300/30 object-cover" /> : <div className="grid h-20 w-20 place-items-center rounded-2xl bg-emerald-400 text-3xl font-black text-slate-950">{(identity?.name ?? email).slice(0, 1).toUpperCase()}</div>}<div><p className="text-sm font-semibold text-emerald-300">Your Vennet profile</p><h1 className="mt-1 text-3xl font-black">{identity?.name ?? "Set up your profile"}</h1><p className="mt-1 text-slate-400">{email}</p></div></div></section><section className="console-panel mt-6 p-7"><h2 className="text-xl font-bold">Profile details</h2><p className="mt-2 text-slate-400">Choose how people see you across Vennet. Add a display name, bio, and profile image.</p>{identity ? <IdentityForm mode="update" defaultName={identity.name} defaultBio={identity.bio} defaultAvatarUrl={identity.avatarUrl ?? ""} /> : <div className="mt-6"><IdentityForm mode="create" defaultName={email.split("@")[0] ?? ""} /><Link href="/settings" className="console-link mt-5 inline-block">Open account settings →</Link></div>}</section></div>;
}
