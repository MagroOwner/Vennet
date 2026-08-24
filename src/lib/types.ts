import type { InferSelectModel } from "drizzle-orm";
import type {
  activityLogs,
  disputes,
  fraudSignals,
  identities,
  listings,
  reputationLogs,
  reputationScores,
  stripeAccounts,
  transactions,
  users,
  verificationRequests,
} from "@/lib/db/schema";

export type Role = "user" | "moderator" | "admin";

export type User = InferSelectModel<typeof users>;
export type Identity = InferSelectModel<typeof identities>;
export type ReputationScore = InferSelectModel<typeof reputationScores>;
export type ReputationLog = InferSelectModel<typeof reputationLogs>;
export type Listing = InferSelectModel<typeof listings>;
export type Transaction = InferSelectModel<typeof transactions>;
export type Dispute = InferSelectModel<typeof disputes>;
export type VerificationRequest = InferSelectModel<typeof verificationRequests>;
export type StripeAccount = InferSelectModel<typeof stripeAccounts>;
export type ActivityLog = InferSelectModel<typeof activityLogs>;
export type FraudSignal = InferSelectModel<typeof fraudSignals>;

export type VerificationStatus = Identity["verificationStatus"];
export type ReputationLevel = ReputationScore["level"];
export type ReputationEventType = ReputationLog["type"];
export type ListingCategory = Listing["category"];
export type ListingStatus = Listing["status"];
export type TransactionStatus = Transaction["status"];
export type DisputeStatus = Dispute["status"];
export type DocumentType = VerificationRequest["documentType"];
export type ActivityType = ActivityLog["type"];
export type FraudSignalType = FraudSignal["type"];

export const LISTING_CATEGORIES = [
  "electronics",
  "fashion",
  "home",
  "services",
  "digital",
  "collectibles",
  "vehicles",
  "other",
] as const satisfies readonly ListingCategory[];

export const DOCUMENT_TYPES = [
  "passport",
  "drivers_license",
  "national_id",
] as const satisfies readonly DocumentType[];

export const DISPUTE_OUTCOMES = [
  "resolved_buyer",
  "resolved_seller",
  "dismissed",
] as const satisfies readonly DisputeStatus[];

export function formatPrice(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export type DisputeOutcome = (typeof DISPUTE_OUTCOMES)[number];

/** Result shape returned by every server action. */
export type ActionResult<T extends object = Record<never, never>> =
  | ({ ok: true } & T)
  | { ok: false; error: string };
