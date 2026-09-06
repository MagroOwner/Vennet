import { notFound } from "next/navigation";
import { AdStudioPlayer } from "@/components/AdStudioPlayer";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdStudioPage() {
  const session = await requireSession("/studio/ads");
  const ownerEmail = process.env.AD_STUDIO_OWNER_EMAIL?.trim().toLowerCase();
  const isOwner = ownerEmail
    ? session.email.trim().toLowerCase() === ownerEmail
    : session.role === "admin";

  if (!isOwner) notFound();

  return <main className="mx-auto max-w-6xl pb-10">
    <AdStudioPlayer />
  </main>;
}
