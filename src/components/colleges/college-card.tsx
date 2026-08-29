"use client";

import Link from "next/link";
import { MapPinIcon, BookmarkIcon, GitCompareArrowsIcon, BuildingIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type CollegeListItem } from "@/features/colleges/college.service";
import { RatingBadge } from "@/components/ui/rating-badge";
import { useCompare } from "@/features/compare/compare.context";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

interface CollegeCardProps {
  college: CollegeListItem;
  isSaved: boolean;
  savedIds: Set<string>;
}

const TYPE_LABEL: Record<string, string> = {
  GOVERNMENT: "Govt.",
  PRIVATE: "Private",
  DEEMED: "Deemed",
};

const STREAM_COLORS: Record<string, string> = {
  Engineering: "bg-blue-100 text-blue-700",
  Medical: "bg-red-100 text-red-700",
  Management: "bg-purple-100 text-purple-700",
  Arts: "bg-yellow-100 text-yellow-700",
  Law: "bg-teal-100 text-teal-700",
};

export function CollegeCard({ college, isSaved }: CollegeCardProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { addToCompare, removeFromCompare, isSelected, canAdd } = useCompare();
  const selected = isSelected(college.id);

  // ── Save / Unsave mutation ──────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isSaved) {
        const res = await fetch(`/api/saved/colleges/${college.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to unsave");
      } else {
        const res = await fetch("/api/saved/colleges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collegeId: college.id }),
        });
        if (!res.ok) throw new Error("Failed to save");
      }
    },
    onSuccess: () => {
      // Invalidate saved query so all components reflect the new state
      queryClient.invalidateQueries({ queryKey: ["saved-colleges"] });
    },
    onError: () => {
      toast.error(isSaved ? "Failed to unsave college" : "Failed to save college");
    },
  });

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session?.user) {
      // Redirect to login instead of silently failing
      window.location.href = "/auth/login";
      return;
    }
    saveMutation.mutate();
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selected) {
      removeFromCompare(college.id);
    } else {
      const ok = addToCompare({
        id: college.id,
        name: college.name,
        city: college.city,
        state: college.state,
      });
      // EDGE CASE: addToCompare returns false when tray is full (>3 selected)
      if (!ok) toast.warning("You can compare at most 3 colleges");
    }
  };

  const streamColor = STREAM_COLORS[college.stream] ?? "bg-slate-100 text-slate-700";

  return (
    <Link
      href={`/colleges/${college.slug}`}
      className="group block bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all duration-200 overflow-hidden"
    >
      {/* Top accent strip */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          {/* Logo placeholder */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
            <BuildingIcon className="w-6 h-6 text-indigo-500" />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Compare checkbox */}
            <button
              onClick={handleCompare}
              aria-label={selected ? "Remove from compare" : "Add to compare"}
              className={cn(
                "p-1.5 rounded-lg transition-colors text-xs",
                selected
                  ? "bg-indigo-100 text-indigo-700"
                  : canAdd
                  ? "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  : "text-slate-300 cursor-not-allowed"
              )}
              disabled={!canAdd && !selected}
            >
              <GitCompareArrowsIcon className="w-4 h-4" />
            </button>

            {/* Bookmark */}
            <button
              onClick={handleSave}
              aria-label={isSaved ? "Remove from saved" : "Save college"}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                isSaved
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
              )}
            >
              <BookmarkIcon className={cn("w-4 h-4", isSaved && "fill-current")} />
            </button>
          </div>
        </div>

        {/* College name */}
        <h3 className="mt-3 font-bold text-slate-900 text-base leading-snug group-hover:text-indigo-700 transition-colors line-clamp-2">
          {college.name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 mt-1 text-slate-500 text-sm">
          <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
          {college.city}, {college.state}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", streamColor)}>
            {college.stream}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {TYPE_LABEL[college.type]}
          </span>
          {college.accreditation && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              NAAC {college.accreditation}
            </span>
          )}
        </div>

        {/* Fees + Rating */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-500">Annual fees</p>
            <p className="text-sm font-semibold text-slate-800">
              {formatINR(college.feesMin)} – {formatINR(college.feesMax)}
            </p>
          </div>
          <RatingBadge rating={college.avgRating} totalReviews={college.totalReviews} size="sm" />
        </div>
      </div>
    </Link>
  );
}
