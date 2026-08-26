import Link from "next/link";
import { notFound } from "next/navigation";
import { FollowCreatorButton } from "@/components/FollowCreatorButton";
import { ReputationBadge, VerifiedBadge } from "@/components/Badges";
import { ListingCard } from "@/components/ListingCard";
import { auth } from "@/lib/auth";
import { getCreatorFollowerCount, getIdentity, getReputationScore, getSellerListings } from "@/lib/queries";
import { levelForScore } from "@/lib/services/reputation";

export const dynamic = "force-dynamic";

export default async function IdentityPage({ params }: { params: { uid: string } }) {
  const identity = await getIdentity(params.uid);
  if (!identity) notFound();

  const [score, listings, followers, session] = await Promise.all([
    getReputationScore(identity.userId),
    getSellerListings(identity.userId),
    getCreatorFollowerCount(identity.userId),
    auth(),
  ]);
  const activeListings = listings.filter((listing) => listing.status === "active");
  const isOwnProfile = session?.user?.id === identity.userId;
  const profile = identity as typeof identity & {
    portfolioUrl?: string | null;
    websiteUrl?: string | null;
    socialLinks?: string[] | null;
    responseTimeHours?: number | null;
  };

  return (
    <main className="space-y-10 pb-12">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950 px-6 py-8 shadow-2xl shadow-emerald-950/15 sm:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(52,211,153,.22),transparent_34%),linear-gradient(115deg,rgba(15,23,42,.96),rgba(2,6,23,.9))]" />
        <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="flex items-center gap-5">
            {identity.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={identity.avatarUrl} alt={identity.name} className="h-24 w-24 rounded-3xl border border-white/20 object-cover shadow-xl" />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-3xl bg-emerald-300 text-4xl font-black text-slate-950">{identity.name.slice(0, 1).toUpperCase()}</div>
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">Creator storefront</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">{identity.name}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <VerifiedBadge status={identity.verificationStatus} />
                <ReputationBadge score={identity.reputationScore} level={score?.level ?? levelForScore(identity.reputationScore)} />
                {identity.isPro && <span className="rounded-full bg-emerald-300 px-2.5 py-1 text-xs font-black text-slate-950">Vennet Pro</span>}
              </div>
            </div>
          </div>
          {isOwnProfile ? (
            <Link href="/profile" className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15">Edit your storefront</Link>
          ) : (
            <FollowCreatorButton creatorId={identity.userId} />
          )}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">About this creator</p>
          <p className="mt-3 max-w-2xl whitespace-pre-wrap text-lg leading-8 text-slate-700">{identity.bio || "This creator has not added a bio yet."}</p>
          {(profile.portfolioUrl || profile.websiteUrl || profile.socialLinks?.length) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {profile.portfolioUrl && <a className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-800 hover:bg-emerald-50" href={profile.portfolioUrl} target="_blank" rel="noreferrer">View portfolio ↗</a>}
              {profile.websiteUrl && <a className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-800 hover:bg-emerald-50" href={profile.websiteUrl} target="_blank" rel="noreferrer">Visit website ↗</a>}
              {profile.socialLinks?.map((url) => <a key={url} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-800 hover:bg-emerald-50" href={url} target="_blank" rel="noreferrer">Social link ↗</a>)}
            </div>
          )}
        </div>
        <aside className="rounded-3xl bg-slate-900 p-7 text-white shadow-xl shadow-slate-900/15">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Storefront at a glance</p>
          <div className="mt-6 grid grid-cols-2 gap-5">
            <div><p className="text-3xl font-black text-emerald-300">{activeListings.length}</p><p className="mt-1 text-sm text-slate-300">Live offers</p></div>
            <div><p className="text-3xl font-black text-emerald-300">{followers}</p><p className="mt-1 text-sm text-slate-300">Followers</p></div>
            <div><p className="text-3xl font-black text-emerald-300">{score?.totalEvents ?? 0}</p><p className="mt-1 text-sm text-slate-300">Trust events</p></div>
            <div><p className="text-lg font-black text-emerald-300">{profile.responseTimeHours ? "≈ " + profile.responseTimeHours + "h" : "—"}</p><p className="mt-1 text-sm text-slate-300">Response time</p></div>
          </div>
          <p className="mt-7 border-t border-white/10 pt-4 text-sm text-slate-300">Member since {identity.createdAt.toLocaleDateString()}</p>
        </aside>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Browse their work</p><h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Featured offers</h2></div>
          <p className="text-sm text-slate-600">{activeListings.length} item{activeListings.length === 1 ? "" : "s"} currently available</p>
        </div>
        {activeListings.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">This creator does not have an active offer yet. Follow them to see their next release.</div>
        ) : (
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{activeListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>
        )}
      </section>
    </main>
  );
}
