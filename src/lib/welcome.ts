import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { welcomeResponses } from "@/lib/db/welcome-schema";

export async function getWelcomeResponse(userId: string) {
  const [response] = await db
    .select()
    .from(welcomeResponses)
    .where(eq(welcomeResponses.userId, userId))
    .limit(1);

  return response ?? null;
}
