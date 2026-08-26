import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getIdentity } from "@/lib/queries";
import { consumeAiRequest, refundAiRequest, WEEKLY_AI_REQUEST_LIMIT } from "@/lib/services/ai-credits";

const systemInstruction = `You are Vennet AI, a concise, practical assistant for digital marketplace creators.
Help with listing titles, descriptions, product positioning, licenses, delivery instructions, launch ideas, buyer support drafts, and creator workflow.
Vennet sells only digital products, online services, and memberships—never physical goods.
Do not promise results, make up marketplace policy, give legal or tax advice, or ask for sensitive personal, Stripe, or payment information.
Use friendly, polished plain English. Prefer actionable drafts and short checklists.`;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to use Vennet AI." }, { status: 401 });

  const identity = await getIdentity(session.user.id);
  if (!identity?.isPro) return NextResponse.json({ error: "Vennet AI is available with Vennet Pro." }, { status: 403 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Vennet AI is not configured yet. Add GEMINI_API_KEY in Vercel to enable it." }, { status: 503 });

  let body: { message?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Please send a valid message." }, { status: 400 }); }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length > 4000) return NextResponse.json({ error: "Messages must be between 1 and 4,000 characters." }, { status: 400 });

  const usage = await consumeAiRequest(session.user.id);
  if (!usage.allowed) return NextResponse.json({ error: "You have used all " + WEEKLY_AI_REQUEST_LIMIT + " Vennet AI requests for this week. Your allowance resets next week.", remaining: 0 }, { status: 429 });

  try {
    const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent", {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: message }] }],
        generationConfig: { maxOutputTokens: 900, temperature: 0.7 },
      }),
    });
    const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; error?: { message?: string } };
    if (!response.ok) {
      await refundAiRequest(session.user.id);
      return NextResponse.json({ error: payload.error?.message ?? "Vennet AI could not complete that request." }, { status: 502 });
    }

    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
    if (!text) {
      await refundAiRequest(session.user.id);
      return NextResponse.json({ error: "Vennet AI returned an empty response. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ text, remaining: usage.remaining });
  } catch {
    await refundAiRequest(session.user.id);
    return NextResponse.json({ error: "Vennet AI is temporarily unavailable. Please try again shortly." }, { status: 503 });
  }
}
