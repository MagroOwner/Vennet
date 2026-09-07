import { notFound } from "next/navigation";
import { AdRecordView } from "@/components/AdRecordView";
import { AD_SCENES } from "@/components/AdScene";
import { AdStudioPlayer } from "@/components/AdStudioPlayer";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdStudioPage({ searchParams }: { searchParams: { record?: string; scene?: string } }) {
  const session = await requireSession("/studio/ads");
  const ownerEmail = process.env.AD_STUDIO_OWNER_EMAIL?.trim().toLowerCase();
  const isOwner = Boolean(ownerEmail) && session.email.trim().toLowerCase() === ownerEmail;

  if (!isOwner) notFound();

  if (searchParams.record === "1") {
    const scene = Number(searchParams.scene ?? "1");
    const index = Number.isInteger(scene) && scene >= 1 && scene <= AD_SCENES.length ? scene - 1 : 0;
    return <AdRecordView index={index} />;
  }

  return <main className="mx-auto max-w-6xl pb-10">
    <AdStudioPlayer />
  </main>;
}
