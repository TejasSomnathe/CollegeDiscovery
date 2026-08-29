/**
 * Extend Auth.js session types to include the user.id field.
 * Without this, TypeScript doesn't know `session.user.id` exists.
 */

import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    };
  }
}
