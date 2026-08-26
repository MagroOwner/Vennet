"use client";

import { useState, useTransition } from "react";
import { toggleCreatorFollow } from "@/lib/actions/community";

export function FollowCreatorButton({ creatorId }: { creatorId: string }) {
  const [following, setFollowing] = useState(false);
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const result = await toggleCreatorFollow(creatorId);
      if (result.ok) setFollowing(result.following);
    });
  }

  return (
    <button type="button" onClick={onClick} disabled={pending} className={following ? "rounded-xl border border-emerald-300/40 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-100 transition hover:bg-emerald-300/20 disabled:opacity-60" : "rounded-xl bg-emerald-300 px-4 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-950/20 transition hover:-translate-y-0.5 hover:bg-emerald-200 disabled:opacity-60"}>
      {pending ? "Updating…" : following ? "Following" : "Follow creator"}
    </button>
  );
}
