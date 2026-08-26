"use client";

import { useState, useTransition } from "react";
import { replyToReview } from "@/lib/actions/community";

export function ReviewReplyForm({ reviewId, existingReply = "" }: { reviewId: string; existingReply?: string }) {
  const [reply, setReply] = useState(existingReply);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  return <div className="mt-3"><textarea rows={2} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Reply to this verified buyer…" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" /><button type="button" disabled={pending || !reply.trim()} onClick={() => startTransition(async () => { const result = await replyToReview({ reviewId, reply }); setMessage(result.ok ? "Reply published." : result.error); })} className="mt-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white disabled:opacity-50">{pending ? "Saving…" : existingReply ? "Update reply" : "Post reply"}</button>{message && <p className="mt-2 text-xs font-bold text-emerald-700">{message}</p>}</div>;
}
