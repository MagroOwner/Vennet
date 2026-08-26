import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getIdentity } from "@/lib/queries";

const instructions = `You are Vennet AI, a concise, practical assistant for digital marketplace creators.
Help with listing titles, descriptions, product positioning, licenses, delivery instructions, launch ideas, buyer support drafts, and creator workflow.
Vennet sells only digital products, online services, and memberships—never physical goods.
Do not promise results, make up marketplace policy, give legal or tax advice, or ask for sensitive personal, Stripe, or payment information.
Use friendly, polished plain English. Prefer actionable drafts and short checklists.`;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to use Vennet AI." }, { status: 401 });

  const identity = await getIdentity(session.user.id);
  if (!identity?.isPro) return NextResponse.json({ error: "Vennet AI is available with Vennet Pro." }, { status: 403 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Vennet AI is not configured yet. Add OPENAI_API_KEY in Vercel to enable it." }, { status: 503 });

  let body: { message?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Please send a valid message." }, { status: 400 }); }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length > 4000) return NextResponse.json({ error: "Messages must be between 1 and 4,000 characters." }, { status: 400 });

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        instructions,
        input: message,
        max_output_tokens: 900,
      }),
    });
    const payload = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }>; error?: { message?: string } };
    if (!response.ok) return NextResponse.json({ error: payload.error?.message ?? "Vennet AI could not complete that request." }, { status: 502 });

    const text = payload.output_text ?? payload.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text;
    if (!text) return NextResponse.json({ error: "Vennet AI returned an empty response. Please try again." }, { status: 502 });
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: "Vennet AI is temporarily unavailable. Please try again shortly." }, { status: 503 });
  }
}
