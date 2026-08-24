import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { AuthError, requireModerator } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Streams a private verification document. Moderators and admins only. */
export async function GET(request: Request): Promise<NextResponse | Response> {
  try {
    await requireModerator();
  } catch (error) {
    const status = error instanceof AuthError ? 401 : 403;
    return NextResponse.json({ error: "Not authorized." }, { status });
  }

  const pathname = new URL(request.url).searchParams.get("pathname");
  if (!pathname || !pathname.startsWith("verificationDocs/")) {
    return NextResponse.json({ error: "Invalid document path." }, { status: 400 });
  }

  const result = await get(pathname, { access: "private" });
  if (!result?.stream) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  return new Response(result.stream, {
    headers: {
      "content-type": result.blob.contentType ?? "application/octet-stream",
      "cache-control": "private, no-store",
    },
  });
}
