import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_BYTES = 10 * 1024 * 1024;

/** Verification documents are stored with private access; only admins can read them back. */
export async function POST(request: Request): Promise<NextResponse> {
  let userId: string;
  try {
    ({ userId } = await requireAuth());
  } catch (error) {
    const status = error instanceof AuthError ? 401 : 403;
    return NextResponse.json({ error: "Not authorized." }, { status });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A file is required." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, or PDF documents are allowed." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Documents must be 10MB or smaller." }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80) || "document";
  const blob = await put(`verificationDocs/${userId}/${Date.now()}-${safeName}`, file, {
    access: "private",
    contentType: file.type,
    addRandomSuffix: true,
  });

  return NextResponse.json({ pathname: blob.pathname });
}
