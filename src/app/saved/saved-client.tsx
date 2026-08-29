"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { BookmarkIcon, GitCompareArrowsIcon, TrashIcon, ArrowRightIcon, LogInIcon } from "lucide-react";
import { formatINR, cn } from "@/lib/utils";
import { RatingBadge } from "@/components/ui/rating-badge";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/lib/toast";
import { useState } from "react";

interface SavedEntry {
  saved: { id: string; userId: string; collegeId: string; createdAt: string };
  college: {
    id: string;
    slug: string;
    name: string;
    city: string;
    state: string;
    stream: string;
    avgRating: number;
    totalReviews: number;
    feesMin: number;
    feesMax: number;
    type: string;
  };
}

interface SavedComparison {
  id: string;
  name: string;
  createdAt: string;
  colleges: {
    id: string;
    slug: string;
    name: string;
    city: string;
    state: string;
  }[];
}

type ActiveTab = "colleges" | "comparisons";

export function SavedClient() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ActiveTab>("colleges");

  const savedQuery = useQuery<{ saved: SavedEntry[] }>({
    queryKey: ["saved-colleges"],
    queryFn: async () => {
      const res = await fetch("/api/saved/colleges");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{ saved: SavedEntry[] }>;
    },
    enabled: !!session?.user,
  });

  const comparisonsQuery = useQuery<{ comparisons: SavedComparison[] }>({
    queryKey: ["saved-comparisons"],
    queryFn: async () => {
      const res = await fetch("/api/saved/comparisons");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{ comparisons: SavedComparison[] }>;
    },
    enabled: !!session?.user,
  });

  const unsaveMutation = useMutation({
    mutationFn: async (collegeId: string) => {
      const res = await fetch(`/api/saved/colleges/${collegeId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-colleges"] });
      toast.success("College removed from saved");
    },
  });

  const deleteComparisonMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/saved/comparisons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-comparisons"] });
      toast.success("Comparison deleted");
    },
  });

  if (status === "loading") {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="text-indigo-600 w-8 h-8" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <LogInIcon className="w-12 h-12 text-indigo-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Sign in to view saved items</h1>
        <p className="text-slate-500 mb-6">
          Save colleges and comparisons by signing in to your CampusPath account.
        </p>
        <Link
          href="/auth/login"
          className="inline-block bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const savedColleges = savedQuery.data?.saved ?? [];
  const savedComparisons = comparisonsQuery.data?.comparisons ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Your Saved Items</h1>
        <p className="text-slate-500 text-sm mt-1">Hello, {session.user.name} 👋</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
        {(["colleges", "comparisons"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
              activeTab === tab
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {tab === "colleges" ? (
              <><BookmarkIcon className="w-4 h-4" /> Colleges ({savedColleges.length})</>
            ) : (
              <><GitCompareArrowsIcon className="w-4 h-4" /> Comparisons ({savedComparisons.length})</>
            )}
          </button>
        ))}
      </div>

      {/* Saved Colleges */}
      {activeTab === "colleges" && (
        <>
          {savedQuery.isLoading && (
            <div className="flex justify-center py-10"><Spinner className="text-indigo-600" /></div>
          )}
          {!savedQuery.isLoading && savedColleges.length === 0 && (
            <div className="text-center py-16">
              <BookmarkIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h2 className="font-semibold text-slate-900 mb-2">No saved colleges yet</h2>
              <p className="text-slate-500 text-sm mb-4">
                Click the bookmark icon on any college card to save it here.
              </p>
              <Link href="/colleges" className="text-indigo-600 font-semibold hover:underline text-sm flex items-center gap-1 justify-center">
                Browse colleges <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          )}
          <div className="space-y-3">
            {savedColleges.map(({ saved, college }) => (
              <div
                key={saved.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/colleges/${college.slug}`}
                    className="font-bold text-slate-900 hover:text-indigo-700 transition-colors"
                  >
                    {college.name}
                  </Link>
                  <p className="text-slate-500 text-sm">
                    {college.city}, {college.state} · {college.stream}
                  </p>
                  <p className="text-slate-700 text-sm font-medium mt-0.5">
                    {formatINR(college.feesMin)} – {formatINR(college.feesMax)}/yr
                  </p>
                </div>
                <RatingBadge rating={college.avgRating} size="sm" />
                <button
                  onClick={() => unsaveMutation.mutate(college.id)}
                  disabled={unsaveMutation.isPending}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                  aria-label="Remove from saved"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Saved Comparisons */}
      {activeTab === "comparisons" && (
        <>
          {comparisonsQuery.isLoading && (
            <div className="flex justify-center py-10"><Spinner className="text-indigo-600" /></div>
          )}
          {!comparisonsQuery.isLoading && savedComparisons.length === 0 && (
            <div className="text-center py-16">
              <GitCompareArrowsIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h2 className="font-semibold text-slate-900 mb-2">No saved comparisons yet</h2>
              <p className="text-slate-500 text-sm mb-4">
                Compare colleges and save the comparison for later.
              </p>
              <Link href="/colleges" className="text-indigo-600 font-semibold hover:underline text-sm flex items-center gap-1 justify-center">
                Start comparing <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          )}
          <div className="space-y-4">
            {savedComparisons.map((comp) => {
              const ids = comp.colleges.map((c) => c.id).join(",");
              return (
                <div key={comp.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-900">{comp.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Saved {new Date(comp.createdAt).toLocaleDateString("en-IN")}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {comp.colleges.map((c) => (
                          <span
                            key={c.id}
                            className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium"
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/compare?ids=${ids}`}
                        className="flex items-center gap-1.5 text-sm bg-indigo-600 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
                      >
                        <GitCompareArrowsIcon className="w-3.5 h-3.5" />
                        View
                      </Link>
                      <button
                        onClick={() => deleteComparisonMutation.mutate(comp.id)}
                        disabled={deleteComparisonMutation.isPending}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Delete comparison"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
