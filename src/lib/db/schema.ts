import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "moderator", "admin"]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "unverified",
  "pending",
  "verified",
  "rejected",
]);

export const reputationLevelEnum = pgEnum("reputation_level", [
  "new",
  "bronze",
  "silver",
  "gold",
  "platinum",
]);

export const reputationEventEnum = pgEnum("reputation_event", [
  "sale_completed",
  "purchase_completed",
  "positive_review",
  "negative_review",
  "dispute_opened",
  "dispute_lost",
  "dispute_won",
  "verification_approved",
  "fraud_flag",
  "admin_adjustment",
]);

export const listingCategoryEnum = pgEnum("listing_category", [
  "electronics",
  "fashion",
  "home",
  "services",
  "digital",
  "collectibles",
  "vehicles",
  "other",
]);

export const listingStatusEnum = pgEnum("listing_status", [
  "active",
  "sold",
  "suspended",
  "draft",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "paid",
  "payout_pending",
  "paid_out",
  "refunded",
  "disputed",
  "failed",
]);

export const disputeStatusEnum = pgEnum("dispute_status", [
  "open",
  "under_review",
  "resolved_buyer",
  "resolved_seller",
  "dismissed",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "passport",
  "drivers_license",
  "national_id",
]);

export const verificationRequestStatusEnum = pgEnum("verification_request_status", [
  "pending",
  "approved",
  "rejected",
]);

export const activityTypeEnum = pgEnum("activity_type", [
  "login",
  "identity_created",
  "identity_updated",
  "listing_created",
  "listing_purchased",
  "dispute_created",
  "verification_submitted",
  "stripe_onboarded",
]);

export const fraudSignalTypeEnum = pgEnum("fraud_signal_type", [
  "rapid_listing_creation",
  "rapid_purchases",
  "self_purchase_attempt",
  "excessive_disputes",
  "reputation_manipulation",
]);

export const severityEnum = pgEnum("severity", ["low", "medium", "high"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    passwordHash: text("password_hash"),
    displayName: text("display_name").notNull().default(""),
    image: text("image"),
    isPro: boolean("is_pro").notNull().default(false),
    disabled: boolean("disabled").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  })
);

export const roles = pgTable("roles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  role: roleEnum("role").notNull().default("user"),
  grantedBy: uuid("granted_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const identities = pgTable("identities", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  bio: text("bio").notNull().default(""),
  avatarUrl: text("avatar_url"),
  verificationStatus: verificationStatusEnum("verification_status")
    .notNull()
    .default("unverified"),
  reputationScore: integer("reputation_score").notNull().default(100),
  isPro: boolean("is_pro").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reputationScores = pgTable("reputation_scores", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  score: integer("score").notNull().default(100),
  level: reputationLevelEnum("level").notNull().default("new"),
  totalEvents: integer("total_events").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reputationLogs = pgTable(
  "reputation_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: reputationEventEnum("type").notNull(),
    delta: integer("delta").notNull(),
    reason: text("reason").notNull(),
    relatedId: text("related_id"),
    actorId: text("actor_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userCreatedIdx: index("reputation_logs_user_created_idx").on(
      table.userId,
      table.createdAt
    ),
  })
);

export const listings = pgTable(
  "listings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: listingCategoryEnum("category").notNull(),
    priceCents: integer("price_cents").notNull(),
    currency: text("currency").notNull().default("usd"),
    imageUrls: jsonb("image_urls").$type<string[]>().notNull().default([]),
    deliveryFilePaths: jsonb("delivery_file_paths").$type<string[]>().notNull().default([]),
    deliveryInstructions: text("delivery_instructions").notNull().default(""),
    supportContact: text("support_contact").notNull().default(""),
    status: listingStatusEnum("status").notNull().default("active"),
    purchaseCount: integer("purchase_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    statusCategoryIdx: index("listings_status_category_idx").on(
      table.status,
      table.category,
      table.createdAt
    ),
    sellerIdx: index("listings_seller_idx").on(table.sellerId, table.createdAt),
  })
);

export const listingImages = pgTable("listing_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id").references(() => listings.id, { onDelete: "cascade" }),
  uploaderId: uuid("uploader_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  blobPath: text("blob_path").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    buyerId: uuid("buyer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amountCents: integer("amount_cents").notNull(),
    platformFeeCents: integer("platform_fee_cents").notNull(),
    currency: text("currency").notNull().default("usd"),
    status: transactionStatusEnum("status").notNull().default("pending"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripeTransferId: text("stripe_transfer_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    buyerIdx: index("transactions_buyer_idx").on(table.buyerId, table.createdAt),
    sellerIdx: index("transactions_seller_idx").on(table.sellerId, table.createdAt),
    intentIdx: index("transactions_intent_idx").on(table.stripePaymentIntentId),
  })
);

export const disputes = pgTable(
  "disputes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => transactions.id, { onDelete: "cascade" }),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    buyerId: uuid("buyer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    status: disputeStatusEnum("status").notNull().default("open"),
    resolution: text("resolution"),
    resolvedBy: uuid("resolved_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    transactionIdx: uniqueIndex("disputes_transaction_idx").on(table.transactionId),
    statusIdx: index("disputes_status_idx").on(table.status, table.createdAt),
    buyerIdx: index("disputes_buyer_idx").on(table.buyerId, table.createdAt),
  })
);

export const disputeMessages = pgTable("dispute_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  disputeId: uuid("dispute_id")
    .notNull()
    .references(() => disputes.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verificationRequests = pgTable(
  "verification_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    documentType: documentTypeEnum("document_type").notNull(),
    documentPaths: jsonb("document_paths").$type<string[]>().notNull().default([]),
    status: verificationRequestStatusEnum("status").notNull().default("pending"),
    reviewedBy: uuid("reviewed_by"),
    reviewNote: text("review_note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("verification_requests_user_idx").on(table.userId, table.createdAt),
    statusIdx: index("verification_requests_status_idx").on(table.status, table.createdAt),
  })
);

export const stripeAccounts = pgTable("stripe_accounts", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  stripeAccountId: text("stripe_account_id").notNull(),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
  chargesEnabled: boolean("charges_enabled").notNull().default(false),
  payoutsEnabled: boolean("payouts_enabled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adPackages = pgTable("ad_packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  priceCents: integer("price_cents").notNull(),
  durationDays: integer("duration_days").notNull(),
  active: boolean("active").notNull().default(true),
});

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: activityTypeEnum("type").notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, string | number | boolean>>()
      .notNull()
      .default({}),
    ip: text("ip"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userTypeIdx: index("activity_logs_user_type_idx").on(
      table.userId,
      table.type,
      table.createdAt
    ),
  })
);

export const fraudSignals = pgTable(
  "fraud_signals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: fraudSignalTypeEnum("type").notNull(),
    severity: severityEnum("severity").notNull(),
    details: text("details").notNull(),
    acknowledged: boolean("acknowledged").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    createdIdx: index("fraud_signals_created_idx").on(table.createdAt),
  })
);
