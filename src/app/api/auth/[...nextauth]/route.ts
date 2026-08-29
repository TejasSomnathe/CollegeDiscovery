/**
 * Auth.js catch-all route handler.
 * Handles GET/POST for all auth endpoints:
 *   - GET  /api/auth/session
 *   - POST /api/auth/signin/credentials
 *   - GET  /api/auth/signout
 *   - GET  /api/auth/csrf
 *   - GET  /api/auth/providers
 */

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
