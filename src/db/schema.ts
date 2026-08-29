/**
 * Drizzle ORM schema — single source of truth for all DB types.
 * We export raw table objects so both the db client and drizzle-kit push can reference them.
 *
 * WHY Drizzle over Prisma: Already wired in the template, TypeScript-first, no code-gen step,
 * and the query builder is type-safe without a separate client binary.
 */

import {
  pgTable,
  pgEnum,
  text,
  integer,
  real,
  boolean,
  timestamp,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const collegeTypeEnum = pgEnum("college_type", [
  "GOVERNMENT",
  "PRIVATE",
  "DEEMED",
]);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey(), // UUIDs generated app-side so we control the type
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Auth.js required tables (Drizzle adapter) ────────────────────────────────
// WHY: Auth.js v5 Drizzle adapter needs sessions/accounts tables even when using
// Credentials provider, because the JWT strategy still calls adapter methods.
// We use JWT strategy (no DB sessions) so only the users table is strictly needed,
// but we include accounts for OAuth extensibility later.

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// ─── Colleges ─────────────────────────────────────────────────────────────────

export const colleges = pgTable("colleges", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  type: collegeTypeEnum("type").notNull(),
  stream: text("stream").notNull(), // Engineering, Medical, Management, Arts, Law
  establishedYear: integer("established_year").notNull(),
  logoUrl: text("logo_url"),
  bannerUrl: text("banner_url"),
  overview: text("overview").notNull(),
  // WHY denormalized avgRating: avoids an expensive aggregate query on every listing page load.
  // We recalculate it synchronously when a new review is submitted (see review service).
  avgRating: real("avg_rating").notNull().default(0),
  totalReviews: integer("total_reviews").notNull().default(0),
  feesMin: integer("fees_min").notNull(), // in INR (annual)
  feesMax: integer("fees_max").notNull(),
  accreditation: text("accreditation"), // NAAC grade e.g. "A++"
  website: text("website"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Courses ──────────────────────────────────────────────────────────────────

export const courses = pgTable("courses", {
  id: text("id").primaryKey(),
  collegeId: text("college_id")
    .notNull()
    .references(() => colleges.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  degree: text("degree").notNull(), // B.Tech, M.Tech, MBA, MBBS, etc.
  durationYears: real("duration_years").notNull(),
  totalFees: integer("total_fees").notNull(), // total programme fees in INR
  seatsAvailable: integer("seats_available").notNull(),
  eligibility: text("eligibility").notNull(),
});

// ─── Placements ───────────────────────────────────────────────────────────────

export const placements = pgTable("placements", {
  id: text("id").primaryKey(),
  collegeId: text("college_id")
    .notNull()
    .references(() => colleges.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  avgPackageLpa: real("avg_package_lpa").notNull(),
  medianPackageLpa: real("median_package_lpa").notNull(),
  highestPackageLpa: real("highest_package_lpa").notNull(),
  placementPercentage: real("placement_percentage").notNull(),
  // Stored as JSON-stringified array — Drizzle pg-core doesn't have a first-class
  // string[] column type without enabling pg arrays; JSON is more portable.
  topRecruiters: text("top_recruiters").notNull().default("[]"),
});

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  collegeId: text("college_id")
    .notNull()
    .references(() => colleges.id, { onDelete: "cascade" }),
  // WHY nullable userId: We allow authenticated reviews only (userId required in the API),
  // but the column is nullable at DB level to allow future anonymous/moderated submissions
  // without a schema migration. The API layer enforces auth.
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  rating: integer("rating").notNull(), // 1–5, validated at API layer
  title: text("title").notNull(),
  body: text("body").notNull(),
  helpful: integer("helpful").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Saved Colleges ───────────────────────────────────────────────────────────

export const savedColleges = pgTable(
  "saved_colleges",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    collegeId: text("college_id")
      .notNull()
      .references(() => colleges.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // WHY uniqueIndex: Prevents duplicate saves; the API upserts on conflict
    // so the operation is idempotent (saves don't error on double-click).
    uniqueIndex("saved_colleges_user_college_idx").on(t.userId, t.collegeId),
  ]
);

// ─── Saved Comparisons ────────────────────────────────────────────────────────

export const savedComparisons = pgTable("saved_comparisons", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Join table: which colleges belong to a saved comparison
export const savedComparisonColleges = pgTable(
  "saved_comparison_colleges",
  {
    comparisonId: text("comparison_id")
      .notNull()
      .references(() => savedComparisons.id, { onDelete: "cascade" }),
    collegeId: text("college_id")
      .notNull()
      .references(() => colleges.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.comparisonId, t.collegeId] })]
);

// ─── Relations (for Drizzle relational queries) ───────────────────────────────

export const collegesRelations = relations(colleges, ({ many }) => ({
  courses: many(courses),
  placements: many(placements),
  reviews: many(reviews),
  savedBy: many(savedColleges),
  comparisons: many(savedComparisonColleges),
}));

export const coursesRelations = relations(courses, ({ one }) => ({
  college: one(colleges, { fields: [courses.collegeId], references: [colleges.id] }),
}));

export const placementsRelations = relations(placements, ({ one }) => ({
  college: one(colleges, { fields: [placements.collegeId], references: [colleges.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  college: one(colleges, { fields: [reviews.collegeId], references: [colleges.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  reviews: many(reviews),
  savedColleges: many(savedColleges),
  savedComparisons: many(savedComparisons),
}));

export const savedCollegesRelations = relations(savedColleges, ({ one }) => ({
  user: one(users, { fields: [savedColleges.userId], references: [users.id] }),
  college: one(colleges, { fields: [savedColleges.collegeId], references: [colleges.id] }),
}));

export const savedComparisonsRelations = relations(savedComparisons, ({ one, many }) => ({
  user: one(users, { fields: [savedComparisons.userId], references: [users.id] }),
  colleges: many(savedComparisonColleges),
}));

export const savedComparisonCollegesRelations = relations(
  savedComparisonColleges,
  ({ one }) => ({
    comparison: one(savedComparisons, {
      fields: [savedComparisonColleges.comparisonId],
      references: [savedComparisons.id],
    }),
    college: one(colleges, {
      fields: [savedComparisonColleges.collegeId],
      references: [colleges.id],
    }),
  })
);
