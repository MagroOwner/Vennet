import { notFound } from "next/navigation";
import { AdStudioPlayer } from "@/components/AdStudioPlayer";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdStudioPage() {
  const session = await requireSession("/studio/ads");

  // The recording studio stays private, but no longer relies on a separate
  // deployment-only email setting that can accidentally lock the owner out.
  if (session.role !== "admin") notFound();

  return <main className="mx-auto max-w-6xl pb-10">
    <AdStudioPlayer />
  </main>;
}
