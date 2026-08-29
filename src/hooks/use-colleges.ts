"use client";

/**
 * TanStack Query hook for the college listing with infinite scroll.
 *
 * WHY useInfiniteQuery: Each page load appends the next cursor to the request.
 * This is more efficient than refetching all pages — and pairs naturally with
 * "Load more" or IntersectionObserver-based auto-fetch.
 */

import { useInfiniteQuery } from "@tanstack/react-query";
import type { CollegeListItem } from "@/features/colleges/college.service";

interface CollegesResponse {
  data: CollegeListItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface FilterParams {
  q?: string;
  city?: string;
  state?: string;
  type?: string;
  stream?: string;
  feesMin?: string;
  feesMax?: string;
  minRating?: string;
  sort?: string;
}

export function useColleges(filters: FilterParams) {
  return useInfiniteQuery<CollegesResponse, Error>({
    queryKey: ["colleges", filters],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      if (pageParam) params.set("cursor", pageParam as string);
      params.set("limit", "12");

      const res = await fetch(`/api/colleges?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch colleges");
      return res.json() as Promise<CollegesResponse>;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
