import Link from "next/link";
import { notFound } from "next/navigation";
import { NewListingForm } from "@/components/forms/NewListingForm";
import { getIdentity, getListing } from "@/lib/queries";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const { userId } = await requireSession("/marketplace/" + params.id + "/edit");
  const [listing, identity] = await Promise.all([getListing(params.id), getIdentity(userId)]);
  if (!listing || listing.sellerId !== userId) notFound();
  if (!identity) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard/seller" className="text-sm font-bold text-emerald-800 hover:text-emerald-950">← Back to seller dashboard</Link>
      <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Edit your listing</h1>
      <p className="mt-2 text-slate-700">Update any listing detail, image, file, access instruction, or support contact. Your active listing stays available while you edit it.</p>
      <NewListingForm isPro={identity.isPro} listing={listing} />
    </div>
  );
}
