import { text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { users } from "@/lib/db/schema";

export const welcomeResponses = pgTable("welcome_responses", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  discoverySource: text("discovery_source").notNull(),
  goal: text("goal").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
});
