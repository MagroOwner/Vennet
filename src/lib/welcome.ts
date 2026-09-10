import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { welcomeResponses } from "@/lib/db/welcome-schema";

export async function getWelcomeResponse(userId: string) {
  try {
    const [response] = await db
      .select()
      .from(welcomeResponses)
      .where(eq(welcomeResponses.userId, userId))
      .limit(1);

    return response ?? null;
  } catch (error) {
    // Keep sign-in usable if a deployment arrives before the database migration.
    console.error("Welcome questionnaire lookup failed", error);
    return undefined;
  }
}
