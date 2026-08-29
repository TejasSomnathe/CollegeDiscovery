# CampusPath — Architecture Overview

> This document is the walkthrough guide for the Loom video. Each section maps to a talking point.

---

## 1. Architecture Overview

```
Browser
  │
  ├── Next.js App Router (Vercel)
  │     ├── Server Components    → page.tsx files (data fetching, SSR)
  │     ├── Client Components    → *-client.tsx, forms, interactive UI
  │     └── Route Handlers       → /app/api/** (REST API)
  │           └── Service Layer  → /features/**/**.service.ts (business logic)
  │                 └── Drizzle ORM → PostgreSQL (Neon)
  │
  ├── Auth.js v5 (JWT strategy, Credentials provider)
  ├── TanStack Query (client-side server state + infinite scroll)
  ├── Zustand/Context (ephemeral UI state — compare tray)
  └── Zod (shared validation, client + server)
```

### Key architectural layers

| Layer | Files | Responsibility |
|---|---|---|
| **Pages / UI** | `src/app/**/page.tsx` | Routing, SSR, metadata |
| **Client components** | `*-client.tsx`, `components/` | Interactivity, TanStack Query hooks |
| **Route handlers** | `src/app/api/**/route.ts` | HTTP layer — validate input, call service, return JSON |
| **Service layer** | `src/features/**/**.service.ts` | Business logic, DB queries — independently testable |
| **Database** | `src/db/schema.ts`, `src/db/index.ts` | Drizzle ORM schema + singleton pool |
| **Shared utilities** | `src/lib/` | Zod schemas, error helpers, toast, utils |

---

## 2. Key Decisions & Why

### Drizzle ORM over Prisma
The sandbox template already wired Drizzle. Beyond that: Drizzle is TypeScript-first (no code-gen), its queries are plain SQL functions that are easy to debug, and `drizzle-kit push` works without migration files — ideal for rapid iteration. Prisma would be an equivalent choice for a fresh project.

### JWT sessions (not DB sessions)
Auth.js v5 supports both. JWT was chosen because:
- Stateless: each request validates the signed cookie without a DB round-trip
- Simpler: no `sessions` table queried on every API call
- Tradeoff: can't instantly revoke a token. For production, add a denylist or switch to DB sessions with short TTLs.

### Cursor pagination over offset
Offset pagination has a fundamental flaw at scale: if a new row is inserted between page 1 and page 2 being fetched, the user sees duplicate or missing items. Cursor pagination uses `(createdAt, id)` as a stable keyset — the client gets an opaque base64url token, and the server uses it to anchor the next query. This also avoids `COUNT(*)` which is expensive on large tables.

### Denormalized `avgRating` on College
Rather than `AVG(reviews.rating)` on every listing page load (which would require an expensive join across 45+ colleges × N reviews), we store the running average on the college row and recalculate it synchronously when a review is inserted (`addReview()` in `college.service.ts`). This is a classic read-optimization write-penalty tradeoff. At higher write volume (>1000 reviews/min), we'd offload recalculation to a background job/queue.

### URL-based filter state
All search filters live in the URL (`?q=&state=&stream=&sort=`). This makes every search result shareable — a student can copy the URL and send it to a parent who sees the identical filtered view. The alternative (local state) is faster to implement but kills shareability.

### Service / Route handler split
Route handlers (`route.ts`) only do three things: parse the request, call a service function, and return a response. All business logic lives in `*.service.ts`. This means:
1. Business logic is independently testable (no HTTP mocking needed)
2. The same service function can be called from both a route handler and a server component
3. Two engineers can work on API + DB simultaneously without merge conflicts in the same file

### Compare tray as Context (not URL)
The "which colleges are selected for comparison right now" is ephemeral session state — it disappears on refresh, which is correct. The final comparison *result* page uses URL params (`?ids=`) so it's shareable. Context keeps the tray lightweight without polluting the URL on every card click.

---

## 3. Data Model Notes

```
colleges ──< courses          (one college → many courses)
colleges ──< placements       (one college → many yearly placement records)
colleges ──< reviews          (one college → many reviews)
users ──< reviews             (one user → many reviews)
users ──< saved_colleges      (many-to-many via saved_colleges join)
users ──< saved_comparisons ──< saved_comparison_colleges ──> colleges
```

**Why `topRecruiters` is a JSON string, not a Postgres array:**
Drizzle's `pg-core` requires explicitly enabling the `pg` array mode. Storing as a JSON-stringified `string[]` is more portable and requires no extra config, at the cost of no native array operators. For filtering "by recruiter", we'd switch to a proper array column or a separate recruiters table.

---

## 4. Edge Cases Handled

| Edge Case | Where | How |
|---|---|---|
| Empty search results | `GET /api/colleges`, listing page UI | Returns `{ data: [], nextCursor: null }` — 200 not 404; UI shows "No colleges found" state |
| Invalid filter values | `collegeListSchema` (Zod) | Coerce numbers, return 400 on schema failure |
| `feesMin > feesMax` in URL | `GET /api/colleges` route handler | Swap them silently — UX-friendly, avoids zero results from UI drag inconsistency |
| Duplicate college saves | `savedColleges` table + service | `onConflictDoNothing()` — idempotent, no 409 error on double-click |
| Compare < 2 or > 3 colleges | `compareSchema` (Zod) | `.min(2).max(3)` with clear error messages |
| Duplicate IDs in compare | `compareSchema` (Zod) | `.refine()` checks `new Set(ids).size === ids.length` |
| Compare IDs not found in DB | `POST /api/compare` | Returns 404 with `{ missingIds: [...] }` detail |
| Malformed cursor | `decodeCursor()` in utils | Returns `null` → ignored → first page returned |
| Last page / no next cursor | `getColleges()` in service | Fetch `limit + 1`, return `nextCursor: null` when fewer than limit+1 results |
| avgRating recalculation | `addReview()` in service | `AVG(rating)` recalculated and written on every new review |
| Password hashing | `register` API + `authorize` | bcrypt with 12 rounds; `compare()` is constant-time (no timing attack) |
| Protected routes | Every auth-required handler | `requireAuth()` calls `auth()` server-side; never trusts client-side session alone |
| Auth session typing | `src/types/next-auth.d.ts` | Extends `Session` type with `user.id` to satisfy TypeScript strict mode |

---

## 5. API Design

```
GET  /api/colleges                         Search + filter + cursor pagination
GET  /api/colleges/[slug]                  Full detail (courses, placements, reviews)
POST /api/colleges/[slug]/reviews          Add review (auth required)
POST /api/compare                          Compare 2-3 colleges by ID
POST /api/auth/register                    Create account
[*]  /api/auth/[...nextauth]               Auth.js handlers (session, signIn, signOut)
GET  /api/saved/colleges                   List saved colleges (auth)
POST /api/saved/colleges                   Save college — idempotent (auth)
DELETE /api/saved/colleges/[collegeId]     Unsave college (auth)
GET  /api/saved/comparisons               List saved comparisons (auth)
POST /api/saved/comparisons               Save a comparison (auth)
DELETE /api/saved/comparisons/[id]        Delete saved comparison (auth)
```

**Consistent error shape:**
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

---

## 6. Folder Structure

```
src/
├── app/                        Next.js App Router pages + API routes
│   ├── api/
│   │   ├── auth/               Auth.js handlers + register
│   │   ├── colleges/           List + detail + reviews
│   │   ├── compare/            Compare endpoint
│   │   └── saved/              Saved colleges + comparisons
│   ├── auth/login|register/    Auth pages
│   ├── colleges/               Listing + detail pages
│   ├── compare/                Comparison view
│   └── saved/                  Saved items page
├── components/
│   ├── colleges/               CollegeCard, FilterSidebar, ReviewForm
│   ├── compare/                CompareTray
│   ├── home/                   HeroSearch
│   ├── layout/                 Navbar
│   └── ui/                     RatingBadge, Spinner, ToastContainer
├── db/
│   ├── schema.ts               Single source of truth for all DB types
│   ├── index.ts                Drizzle client + singleton pool
│   └── seed.ts                 45-college seed script
├── features/
│   ├── colleges/college.service.ts   College business logic
│   ├── compare/compare.context.tsx   Compare tray state (client)
│   └── saved/saved.service.ts        Saved items business logic
├── hooks/                      TanStack Query hooks (useColleges, useSavedColleges)
├── lib/
│   ├── auth.ts                 Auth.js config + requireAuth guard
│   ├── errors.ts               Consistent error response helpers
│   ├── toast.ts                Lightweight toast event system
│   ├── utils.ts                cn(), formatINR(), cursor encode/decode
│   └── validations.ts          Zod schemas (shared client + server)
└── types/
    └── next-auth.d.ts          Session type augmentation
```

---

## 7. What I'd Do Differently With More Time

1. **Full-text search with PostgreSQL `tsvector`** — current ILIKE search is functional but not ranked. A GIN index on a tsvector column would enable ranked full-text search with proper stemming.

2. **Redis cache for listing page** — the listing query with complex filters runs on every request. A Redis layer with a short TTL (30s) and cache-key derived from the filter params would dramatically reduce DB load.

3. **Background job for avgRating** — currently recalculated synchronously on review insert. For high-volume write scenarios, enqueue a job to a queue (e.g., BullMQ / Inngest) to recalculate asynchronously.

4. **E2E tests with Playwright** — the edge cases are documented and handled in code, but automated tests would give confidence in regressions. Priority flows: search → filter → detail → review → compare → save.

5. **Image handling** — college logos and banners are `null` in seed data. In production, integrate with Cloudflare Images or AWS S3 with presigned upload URLs.

6. **Review moderation** — currently no spam protection. Would add: rate limiting (1 review/college/user), honeypot fields, and optionally an LLM-based toxicity filter before inserting.

7. **Proper DB migrations** — `drizzle-kit push` is great for development but risky in production (it applies schema changes directly). For production, use `drizzle-kit generate` + `drizzle-kit migrate` with a controlled CI/CD step.

8. **Optimistic updates** — the save/unsave flow currently waits for the server response. With optimistic updates, the bookmark icon would toggle instantly and roll back on error.

---

## 8. Deployment Notes (Vercel + Neon)

1. Push the repo to GitHub
2. Import project in Vercel — framework auto-detected as Next.js
3. Create a Neon PostgreSQL database → copy the connection string
4. Set environment variables in Vercel:
   - `DATABASE_URL` — Neon connection string (use the pooled connection string for production)
   - `AUTH_SECRET` — generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` — your production Vercel URL
5. On first deploy, run the seed script:
   ```bash
   # From local with DATABASE_URL pointing to Neon
   npx tsx src/db/seed.ts
   ```
6. Drizzle schema: run `npx drizzle-kit push` after environment is live

**Neon-specific note:** Use the connection pooling URL (`.pooler.neon.tech`) for the app, and the direct URL for migrations. Neon's serverless autoscale means the app can handle traffic bursts without pre-provisioning.
