import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { collections, Timestamp } from "../lib/firestore";
import { raiseFraudSignal } from "../lib/fraud";
import type { ActivityLogDoc } from "../types";

/**
 * Rule-based fraud detection that runs on every activity log write.
 * Raises fraudSignals documents that surface in the admin dashboard.
 */
export const detectFraud = onDocumentCreated("activityLogs/{logId}", async (event) => {
  const data = event.data?.data() as ActivityLogDoc | undefined;
  if (!data) return;

  const { uid, type } = data;
  const hourAgo = Timestamp.fromMillis(Date.now() - 60 * 60 * 1000);

  const recent = await collections
    .activityLogs()
    .where("uid", "==", uid)
    .where("createdAt", ">=", hourAgo)
    .get();

  const counts: Record<string, number> = {};
  recent.forEach((doc) => {
    const t = doc.data().type;
    counts[t] = (counts[t] ?? 0) + 1;
  });

  if (type === "listing_created" && (counts["listing_created"] ?? 0) > 15) {
    await raiseFraudSignal(uid, "rapid_listing_creation", "high",
      `${counts["listing_created"]} listings created within an hour`);
  }

  if (type === "listing_purchased" && (counts["listing_purchased"] ?? 0) > 20) {
    await raiseFraudSignal(uid, "rapid_purchases", "high",
      `${counts["listing_purchased"]} purchases within an hour`);
  }

  if (type === "dispute_created" && (counts["dispute_created"] ?? 0) > 3) {
    await raiseFraudSignal(uid, "excessive_disputes", "medium",
      `${counts["dispute_created"]} disputes opened within an hour`);
  }

  logger.debug(`Fraud scan complete for ${uid} (${type})`);
});
