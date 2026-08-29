"use client";

/**
 * Colleges listing page — client component that reads filter state from URL params.
 *
 * WHY URL-based filter state: Results are shareable/bookmarkable. If a student
 * finds their ideal filter combo, they can share the URL and the recipient sees
 * the same results instantly — no manual re-filtering needed.
 */

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useColleges } from "@/hooks/use-colleges";
import { useSavedColleges } from "@/hooks/use-saved-colleges";
import { CollegeCard } from "@/components/colleges/college-card";
import { FilterSidebar } from "@/components/colleges/filter-sidebar";
import { Spinner } from "@/components/ui/spinner";
import { SearchIcon, SlidersHorizontalIcon } from "lucide-react";
import { useState } from "react";

const SORT_OPTIONS = [
  { value: "rating_desc", label: "Rating: High to Low" },
  { value: "rating_asc", label: "Rating: Low to High" },
  { value: "fees_asc", label: "Fees: Low to High" },
  { value: "fees_desc", label: "Fees: High to Low" },
  { value: "name_asc", label: "Name: A–Z" },
  { value: "established_asc", label: "Est.: Oldest First" },
  { value: "established_desc", label: "Est.: Newest First" },
];

export function CollegesClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Read all filter state from URL — this keeps filters shareable/bookmarkable
  const filters = {
    q: searchParams.get("q") ?? undefined,
    city: searchParams.get("city") ?? undefined,
    state: searchParams.get("state") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    stream: searchParams.get("stream") ?? undefined,
    feesMin: searchParams.get("feesMin") ?? undefined,
    feesMax: searchParams.get("feesMax") ?? undefined,
    minRating: searchParams.get("minRating") ?? undefined,
    sort: searchParams.get("sort") ?? "rating_desc",
  };

  const { data, isFetchingNextPage, fetchNextPage, hasNextPage, isLoading, isError } =
    useColleges(filters);

  const { savedIds } = useSavedColleges();

  // IntersectionObserver for auto-load-more
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset cursor when filters change
      params.delete("cursor");
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const allColleges = data?.pages.flatMap((p) => p.data) ?? [];
  const totalFound = allColleges.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Browse Colleges</h1>
        <p className="text-slate-500 text-sm mt-1">
          Find the right college using filters, search, and sorting
        </p>
      </div>

      {/* Search bar + controls */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, city, or stream..."
            defaultValue={filters.q}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateFilter("q", (e.target as HTMLInputElement).value || undefined);
              }
            }}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>

        <select
          value={filters.sort}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 hidden sm:block"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white hover:bg-slate-50 lg:hidden"
        >
          <SlidersHorizontalIcon className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar — desktop always visible, mobile as drawer */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <FilterSidebar filters={filters} onUpdate={updateFilter} />
        </aside>

        {/* Mobile drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl overflow-y-auto">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <span className="font-semibold">Filters</span>
                <button onClick={() => setSidebarOpen(false)} className="text-slate-500">
                  ✕
                </button>
              </div>
              <div className="p-4">
                <FilterSidebar filters={filters} onUpdate={updateFilter} onClose={() => setSidebarOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Main grid */}
        <div className="flex-1 min-w-0">
          {/* Result count */}
          {!isLoading && (
            <p className="text-sm text-slate-500 mb-4">
              {isError
                ? "Failed to load colleges"
                : totalFound === 0
                ? "No colleges found — try adjusting your filters"
                : `Showing ${totalFound} college${totalFound !== 1 ? "s" : ""}${hasNextPage ? "+" : ""}`}
            </p>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-52 animate-pulse">
                  <div className="h-12 w-12 bg-slate-200 rounded-xl mb-3" />
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="text-center py-16">
              <p className="text-slate-500">Something went wrong. Please try again.</p>
            </div>
          )}

          {/* EDGE CASE: empty results */}
          {!isLoading && !isError && totalFound === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-semibold text-slate-900 mb-2">No colleges found</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Try adjusting your filters, removing the search query, or exploring a different stream.
              </p>
              <button
                onClick={() => router.replace(pathname)}
                className="mt-4 text-indigo-600 text-sm font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* College grid */}
          {!isLoading && totalFound > 0 && (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {allColleges.map((college) => (
                <CollegeCard
                  key={college.id}
                  college={college}
                  isSaved={savedIds.has(college.id)}
                  savedIds={savedIds}
                />
              ))}
            </div>
          )}

          {/* Infinite scroll sentinel + load more */}
          <div ref={sentinelRef} className="mt-8 text-center">
            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <Spinner className="text-indigo-600" />
              </div>
            )}
            {/* EDGE CASE: last page — no next cursor, show end message */}
            {!hasNextPage && totalFound > 0 && (
              <p className="text-slate-400 text-sm py-4">
                You&apos;ve seen all {totalFound} colleges
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
