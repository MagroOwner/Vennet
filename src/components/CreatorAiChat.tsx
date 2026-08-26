"use client";

import { FormEvent, useState } from "react";

type Message = { role: "user" | "assistant"; text: string };

const prompts = [
  "Write a stronger title and description for my digital product.",
  "Give me a launch plan for a new creative service.",
  "Help me write friendly delivery instructions for buyers.",
  "Improve this buyer support reply so it is clear and professional.",
];

export function CreatorAiChat({ creatorName }: { creatorName: string }) {
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: "Hi " + creatorName + "—what are you working on today? I can help you sharpen a listing, plan a launch, or draft a buyer-ready response." }]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(message = draft) {
    const clean = message.trim();
    if (!clean || busy) return;
    setMessages((current) => [...current, { role: "user", text: clean }]);
    setDraft("");
    setBusy(true);
    try {
      const response = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: clean }) });
      const payload = await response.json() as { text?: string; error?: string };
      setMessages((current) => [...current, { role: "assistant", text: payload.text ?? payload.error ?? "Something went wrong. Please try again." }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", text: "I could not reach Vennet AI. Please try again in a moment." }]);
    } finally { setBusy(false); }
  }

  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void send(); }

  return <section className="mt-7 grid gap-6 lg:grid-cols-[.67fr_1.33fr]">
    <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700">Start with a prompt</p><h2 className="mt-2 text-2xl font-black text-slate-950">Your creator copilot</h2><p className="mt-3 text-sm leading-6 text-slate-600">Vennet AI is designed for your digital offers—not generic business advice.</p><div className="mt-6 space-y-2">{prompts.map((prompt) => <button key={prompt} type="button" disabled={busy} onClick={() => void send(prompt)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-sm font-bold leading-5 text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-50">{prompt} <span className="ml-1 text-emerald-700">→</span></button>)}</div><p className="mt-6 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">Do not share passwords, payment details, private buyer information, or Stripe account details with AI.</p></aside>
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-4"><div><p className="font-black text-slate-950">Vennet AI</p><p className="mt-0.5 text-xs font-semibold text-emerald-700">Pro creator assistant</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Pro</span></div>
      <div className="min-h-[390px] space-y-4 bg-[linear-gradient(180deg,#fff,#f8fafc)] p-5 sm:p-6">{messages.map((message, index) => <div key={index} className={"max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm " + (message.role === "user" ? "ml-auto rounded-br-md bg-slate-950 font-medium text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-700")}><p className={"mb-1 text-xs font-black " + (message.role === "user" ? "text-emerald-300" : "text-emerald-700")}>{message.role === "user" ? "You" : "Vennet AI"}</p>{message.text}</div>)}{busy && <div className="w-fit rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-500">Thinking<span className="animate-pulse">…</span></div>}</div>
      <form onSubmit={submit} className="border-t border-slate-100 bg-white p-4 sm:p-5"><label htmlFor="ai-message" className="sr-only">Ask Vennet AI</label><textarea id="ai-message" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={4000} rows={3} placeholder="Ask Vennet AI for help with your next listing…" className="w-full resize-none rounded-xl border border-slate-300 bg-white p-3 text-sm leading-6 text-slate-950 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none" /><div className="mt-3 flex items-center justify-between gap-3"><p className="text-xs text-slate-500">AI can make mistakes—review before publishing.</p><button disabled={busy || !draft.trim()} className="rounded-xl bg-emerald-300 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Thinking…" : "Send →"}</button></div></form>
    </div>
  </section>;
}
