

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { loginSchema } from "@/lib/validations";

export const { handlers, auth, signIn, signOut } = NextAuth({

  trustHost: true,

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, parsed.data.email))
          .limit(1)
          .then((r) => r[0] ?? null);

        if (!user) return null;

      
        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],


  session: { strategy: "jwt" },

  callbacks: {
   
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
   
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


export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user as { id: string; name: string; email: string };
}
