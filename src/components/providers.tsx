"use client";

/**
 * Client-side providers wrapper.
 * Kept minimal — only providers that must be client-side live here.
 * TanStack Query and SessionProvider both require client context.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState, type ReactNode } from "react";
import { CompareProvider } from "@/features/compare/compare.context";

export function Providers({ children }: { children: ReactNode }) {
  // WHY useState for QueryClient: ensures each user gets their own client in SSR,
  // preventing state leakage between requests.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute — college data doesn't change often
            retry: 1,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <CompareProvider>{children}</CompareProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
