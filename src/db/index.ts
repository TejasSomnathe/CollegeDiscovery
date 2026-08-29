import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

// WHY singleton pool: Next.js hot-reload in dev creates new module instances,
// which would exhaust Postgres connection limits without this global guard.
const globalForDb = globalThis as typeof globalThis & {
  __collegeDiscoveryPool?: Pool;
};

export const pool =
  globalForDb.__collegeDiscoveryPool ??
  new Pool({
    connectionString: databaseUrl,
    max: 20, // cap connections for Neon's shared pool
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__collegeDiscoveryPool = pool;
}

// Pass schema to drizzle so we can use the relational query API (db.query.colleges...)
export const db = drizzle(pool, { schema });
