import { Timestamp } from "firebase-admin/firestore";

export type Role = "user" | "moderator" | "admin";

export interface UserDoc {
  email: string;
  displayName: string;
  isPro: boolean;
  disabled: boolean;
  stripeAccountId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface IdentityDoc {
  uid: string;
  name: string;
  bio: string;
  avatarUrl?: string;
  verificationStatus: VerificationStatus;
  reputationScore: number;
  isPro: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ReputationScoreDoc {
  uid: string;
  score: number;
  level: "new" | "bronze" | "silver" | "gold" | "platinum";
  totalEvents: number;
  updatedAt: Timestamp;
}

export type ReputationEventType =
  | "sale_completed"
  | "purchase_completed"
  | "positive_review"
  | "negative_review"
  | "dispute_opened"
  | "dispute_lost"
  | "dispute_won"
  | "verification_approved"
  | "fraud_flag"
  | "admin_adjustment";

export interface ReputationLogDoc {
  uid: string;
  type: ReputationEventType;
  delta: number;
  reason: string;
  relatedId?: string;
  actorUid: string;
  createdAt: Timestamp;
}

export type ListingCategory =
  | "electronics"
  | "fashion"
  | "home"
  | "services"
  | "digital"
  | "collectibles"
  | "vehicles"
  | "other";

export type ListingStatus = "active" | "sold" | "suspended" | "draft";

export interface ListingDoc {
  sellerId: string;
  title: string;
  description: string;
  category: ListingCategory;
  priceCents: number;
  currency: string;
  imageUrls: string[];
  status: ListingStatus;
  purchaseCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ListingImageDoc {
  listingId: string;
  uploaderId: string;
  storagePath: string;
  url: string;
  createdAt: Timestamp;
}

export type TransactionStatus =
  | "pending"
  | "paid"
  | "payout_pending"
  | "paid_out"
  | "refunded"
  | "disputed"
  | "failed";

export interface TransactionDoc {
  listingId: string;
  buyerId: string;
  sellerId: string;
  amountCents: number;
  platformFeeCents: number;
  currency: string;
  status: TransactionStatus;
  stripePaymentIntentId?: string;
  stripeTransferId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type DisputeStatus = "open" | "under_review" | "resolved_buyer" | "resolved_seller" | "dismissed";

export interface DisputeMessage {
  senderUid: string;
  body: string;
  createdAt: Timestamp;
}

export interface DisputeDoc {
  transactionId: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  reason: string;
  status: DisputeStatus;
  messages: DisputeMessage[];
  resolution?: string;
  resolvedBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface VerificationRequestDoc {
  uid: string;
  fullName: string;
  documentType: "passport" | "drivers_license" | "national_id";
  documentPaths: string[];
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  reviewNote?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface StripeAccountDoc {
  uid: string;
  stripeAccountId: string;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AdPackageDoc {
  name: string;
  description: string;
  priceCents: number;
  durationDays: number;
  active: boolean;
}

export type ActivityType =
  | "login"
  | "identity_created"
  | "identity_updated"
  | "listing_created"
  | "listing_purchased"
  | "dispute_created"
  | "verification_submitted"
  | "stripe_onboarded";

export interface ActivityLogDoc {
  uid: string;
  type: ActivityType;
  metadata: Record<string, string | number | boolean>;
  ip?: string;
  createdAt: Timestamp;
}

export type FraudSignalType =
  | "rapid_listing_creation"
  | "rapid_purchases"
  | "self_purchase_attempt"
  | "excessive_disputes"
  | "reputation_manipulation";

export interface FraudSignalDoc {
  uid: string;
  type: FraudSignalType;
  severity: "low" | "medium" | "high";
  details: string;
  acknowledged: boolean;
  createdAt: Timestamp;
}

export interface RoleDoc {
  role: Role;
  grantedBy: string;
  updatedAt: Timestamp;
}
