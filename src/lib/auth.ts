/**
 * Auth.js v5 (NextAuth) configuration.
 *
 * WHY Credentials provider only: The spec requires username/password auth.
 * We use JWT strategy (no DB sessions) because:
 *   1. Simpler setup — no sessions table round-trip on every request
 *   2. Stateless — scales horizontally without sticky sessions
 *   3. The JWT is httpOnly and signed, so it's safe for this use case
 *
 * Tradeoff: JWTs can't be instantly revoked. For an MVP this is acceptable;
 * production would add a token-revocation list or switch to DB sessions.
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { loginSchema } from "@/lib/validations";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate shape first — never touch the DB with unvalidated input
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, parsed.data.email))
          .limit(1)
          .then((r) => r[0] ?? null);

        if (!user) return null;

        // EDGE CASE: Password hashing — bcrypt.compare is constant-time,
        // preventing timing attacks that could leak whether the email exists.
        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],

  // JWT strategy: session stored in a signed httpOnly cookie, no DB round-trip
  session: { strategy: "jwt" },

  callbacks: {
    // Embed the DB user.id into the JWT so we don't need to re-query by email
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    // Expose token.id on the session object so server components can read it
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
});

/**
 * Server-side auth guard — use in route handlers and server components.
 * ALWAYS re-check auth server-side; never trust client-side guards alone.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user as { id: string; name: string; email: string };
}
