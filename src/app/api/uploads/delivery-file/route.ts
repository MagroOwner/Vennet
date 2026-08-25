import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_BYTES = 25 * 1024 * 1024;

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
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Delivery files must be 25MB or smaller. Use a ZIP file for folders." }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100) || "download";
  const blob = await put("deliveryFiles/" + userId + "/" + Date.now() + "-" + safeName, file, {
    access: "private",
    contentType: file.type || "application/octet-stream",
    addRandomSuffix: true,
  });

  return NextResponse.json({ pathname: blob.pathname, name: file.name });
}
