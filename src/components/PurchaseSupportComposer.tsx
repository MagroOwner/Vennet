"use client";

import { useState, useTransition } from "react";
import { sendPurchaseMessage } from "@/lib/actions/community";

export function PurchaseSupportComposer({ transactionId }: { transactionId: string }) {
  const [body, setBody] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await sendPurchaseMessage({ transactionId, body });
      if (result.ok) {
        setBody("");
        setNotice("Message sent. Refreshing this page will show the conversation.");
      } else setNotice(result.error);
    });
  }

  return <form onSubmit={submit} className="mt-4">
    <label className="sr-only" htmlFor={"support-" + transactionId}>Message the seller</label>
    <textarea id={"support-" + transactionId} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Ask about access, delivery, or licensing…" className="min-h-24 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm leading-6 text-slate-900 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none" />
    <button disabled={pending || !body.trim()} className="mt-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:opacity-50">{pending ? "Sending…" : "Send message"}</button>
    {notice && <p className="mt-2 text-sm font-semibold text-emerald-700">{notice}</p>}
  </form>;
}
