import { get } from "@vercel/blob";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { listings, transactions } from "@/lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse | Response> {
  let userId: string;
  try {
    ({ userId } = await requireAuth());
  } catch (error) {
    const status = error instanceof AuthError ? 401 : 403;
    return NextResponse.json({ error: "Not authorized." }, { status });
  }

  const pathname = new URL(request.url).searchParams.get("pathname");
  if (!pathname || !pathname.startsWith("deliveryFiles/")) {
    return NextResponse.json({ error: "Invalid delivery file." }, { status: 400 });
  }

  const purchases = await db
    .select({ deliveryFilePaths: listings.deliveryFilePaths })
    .from(transactions)
    .innerJoin(listings, eq(transactions.listingId, listings.id))
    .where(and(eq(transactions.buyerId, userId), eq(transactions.status, "paid")));

  if (!purchases.some((purchase) => purchase.deliveryFilePaths.includes(pathname))) {
    return NextResponse.json({ error: "This download is not available in your inventory." }, { status: 403 });
  }

  const result = await get(pathname, { access: "private" });
  if (!result?.stream) return NextResponse.json({ error: "File not found." }, { status: 404 });

  return new Response(result.stream, {
    headers: {
      "content-type": result.blob.contentType ?? "application/octet-stream",
      "content-disposition": "attachment",
      "cache-control": "private, no-store",
    },
  });
}
