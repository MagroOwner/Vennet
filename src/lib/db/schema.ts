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
    emailVerified: timestamp("email_verified", { withTimezone: true }),
    isPro: boolean("is_pro").notNull().default(false),
    disabled: boolean("disabled").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  })
);

export const emailVerificationTokens = pgTable(
  "email_verification_tokens",
  {
    email: text("email").primaryKey(),
    passwordHash: text("password_hash").notNull(),
    displayName: text("display_name").notNull().default(""),
    codeHash: text("code_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    attempts: integer("attempts").notNull().default(0),
    referralCode: text("referral_code").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    expiresIdx: index("email_verification_tokens_expires_idx").on(table.expiresAt),
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
    previewUrl: text("preview_url").notNull().default(""),
    collection: text("collection").notNull().default(""),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    licenseType: text("license_type").notNull().default("Personal use"),
    deliveryTime: text("delivery_time").notNull().default("Available after payment"),
    viewCount: integer("view_count").notNull().default(0),
    featured: boolean("featured").notNull().default(false),
    fileType: text("file_type").notNull().default(""),
    compatibility: text("compatibility").notNull().default(""),
    includesUpdates: boolean("includes_updates").notNull().default(false),
    updatePolicy: text("update_policy").notNull().default(""),
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

export const savedListings = pgTable(
  "saved_listings",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    listingId: uuid("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    savedIdx: uniqueIndex("saved_listings_user_listing_idx").on(table.userId, table.listingId),
    listingIdx: index("saved_listings_listing_idx").on(table.listingId),
  })
);

export const creatorFollows = pgTable(
  "creator_follows",
  {
    followerId: uuid("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    followIdx: uniqueIndex("creator_follows_follower_creator_idx").on(table.followerId, table.creatorId),
    creatorIdx: index("creator_follows_creator_idx").on(table.creatorId),
  })
);

export const listingReviews = pgTable(
  "listing_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    transactionId: uuid("transaction_id").notNull().references(() => transactions.id, { onDelete: "cascade" }),
    listingId: uuid("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
    buyerId: uuid("buyer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    sellerId: uuid("seller_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    body: text("body").notNull().default(""),
    hidden: boolean("hidden").notNull().default(false),
    sellerReply: text("seller_reply").notNull().default(""),
    sellerRepliedAt: timestamp("seller_replied_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    transactionIdx: uniqueIndex("listing_reviews_transaction_idx").on(table.transactionId),
    listingIdx: index("listing_reviews_listing_idx").on(table.listingId, table.createdAt),
  })
);

export const purchaseMessages = pgTable(
  "purchase_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    transactionId: uuid("transaction_id").notNull().references(() => transactions.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({ transactionIdx: index("purchase_messages_transaction_idx").on(table.transactionId, table.createdAt) })
);

export const sellerCoupons = pgTable(
  "seller_coupons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sellerId: uuid("seller_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    discountPercent: integer("discount_percent").notNull(),
    active: boolean("active").notNull().default(true),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({ sellerCodeIdx: uniqueIndex("seller_coupons_seller_code_idx").on(table.sellerId, table.code) })
);

export const referralCodes = pgTable(
  "referral_codes",
  {
    userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({ codeIdx: uniqueIndex("referral_codes_code_idx").on(table.code) })
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull().default(""),
    href: text("href").notNull().default(""),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({ userIdx: index("notifications_user_idx").on(table.userId, table.createdAt) })
);

export const priceAlerts = pgTable(
  "price_alerts",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    listingId: uuid("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({ alertIdx: uniqueIndex("price_alerts_user_listing_idx").on(table.userId, table.listingId) })
);

export const referrals = pgTable(
  "referrals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    referrerId: uuid("referrer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    refereeId: uuid("referee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("signed_up"),
    rewardCents: integer("reward_cents").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    qualifiedAt: timestamp("qualified_at", { withTimezone: true }),
  },
  (table) => ({
    refereeIdx: uniqueIndex("referrals_referee_idx").on(table.refereeId),
    referrerIdx: index("referrals_referrer_idx").on(table.referrerId, table.createdAt),
  })
);

export const listingBundles = pgTable(
  "listing_bundles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sellerId: uuid("seller_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    listingIds: jsonb("listing_ids").$type<string[]>().notNull().default([]),
    discountPercent: integer("discount_percent").notNull().default(10),
    active: boolean("active").notNull().default(true),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({ sellerIdx: index("listing_bundles_seller_idx").on(table.sellerId, table.createdAt) })
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
