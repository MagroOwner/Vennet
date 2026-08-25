import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  let userId: string;
  try {
    ({ userId } = await requireAuth());
  } catch (error) {
    return NextResponse.json({ error: "Not authorized." }, { status: error instanceof AuthError ? 401 : 403 });
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Choose a JPG, PNG, or WebP image." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Profile images must be 5MB or smaller." }, { status: 400 });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80) || "avatar";
  const blob = await put("avatars/" + userId + "/" + Date.now() + "-" + safeName, file, { access: "public", contentType: file.type, addRandomSuffix: true });
  return NextResponse.json({ url: blob.url });
}
