"use client";

/**
 * College detail page — client wrapper that handles:
 * - Sticky in-page tab navigation (Overview/Courses/Placements/Reviews)
 * - Save/Bookmark action
 * - Add to Compare action
 * - Review form
 */

import { useState, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPinIcon, CalendarIcon, BuildingIcon, GlobeIcon, BookmarkIcon, GitCompareArrowsIcon, StarIcon, TrophyIcon, UsersIcon, BadgeCheckIcon } from "lucide-react";
import { type CollegeDetail } from "@/features/colleges/college.service";
import { RatingBadge } from "@/components/ui/rating-badge";
import { ReviewForm } from "@/components/colleges/review-form";
import { useCompare } from "@/features/compare/compare.context";
import { useSavedColleges } from "@/hooks/use-saved-colleges";
import { formatINR, formatLPA, cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

interface Props {
  college: CollegeDetail;
}

const TABS = ["overview", "courses", "placements", "reviews"] as const;
type Tab = typeof TABS[number];

const TAB_LABELS: Record<Tab, string> = {
  overview: "Overview",
  courses: "Courses",
  placements: "Placements",
  reviews: "Reviews",
};

const TYPE_LABEL: Record<string, string> = {
  GOVERNMENT: "Government",
  PRIVATE: "Private",
  DEEMED: "Deemed University",
};

export function CollegeDetailClient({ college }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const tabRefs = useRef<Record<Tab, HTMLElement | null>>({
    overview: null,
    courses: null,
    placements: null,
    reviews: null,
  });

  const { data: session } = useSession();
  const { savedIds } = useSavedColleges();
  const { addToCompare, removeFromCompare, isSelected, canAdd } = useCompare();
  const queryClient = useQueryClient();

  const isSaved = savedIds.has(college.id);
  const isCompareSelected = isSelected(college.id);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isSaved) {
        await fetch(`/api/saved/colleges/${college.id}`, { method: "DELETE" });
      } else {
        await fetch("/api/saved/colleges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collegeId: college.id }),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-colleges"] });
      toast.success(isSaved ? "Removed from saved" : "College saved!");
    },
  });

  const scrollToTab = (tab: Tab) => {
    setActiveTab(tab);
    const el = tabRefs.current[tab];
    if (el) {
      const offset = 120;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const handleCompare = () => {
    if (isCompareSelected) {
      removeFromCompare(college.id);
    } else {
      const ok = addToCompare({
        id: college.id,
        name: college.name,
        city: college.city,
        state: college.state,
      });
      if (!ok) toast.warning("You can compare at most 3 colleges");
    }
  };

  const latestPlacement = college.placements?.[0];
  const topRecruiters: string[] = latestPlacement
    ? (JSON.parse(latestPlacement.topRecruiters) as string[])
    : [];

  return (
    <div className="min-h-screen">
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center flex-shrink-0">
              <BuildingIcon className="w-10 h-10 text-white/80" />
            </div>

            <div className="flex-1">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-indigo-300 text-xs mb-2">
                <Link href="/colleges" className="hover:text-white">Colleges</Link>
                <span>/</span>
                <span className="text-white">{college.name}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold">{college.name}</h1>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-indigo-200">
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" />
                  {college.city}, {college.state}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  Est. {college.establishedYear}
                </span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-medium">
                  {TYPE_LABEL[college.type]}
                </span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-medium">
                  {college.stream}
                </span>
                {college.accreditation && (
                  <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-xs font-medium">
                    <BadgeCheckIcon className="w-3.5 h-3.5" />
                    NAAC {college.accreditation}
                  </span>
                )}
              </div>

              {/* Rating row */}
              <div className="mt-3">
                <RatingBadge rating={college.avgRating} totalReviews={college.totalReviews} size="lg" />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 sm:flex-col">
              <button
                onClick={() => {
                  if (!session?.user) {
                    window.location.href = "/auth/login";
                    return;
                  }
                  saveMutation.mutate();
                }}
                className={cn(
                  "flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-colors",
                  isSaved
                    ? "bg-white text-indigo-700"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                )}
              >
                <BookmarkIcon className={cn("w-4 h-4", isSaved && "fill-current")} />
                {isSaved ? "Saved" : "Save"}
              </button>

              <button
                onClick={handleCompare}
                className={cn(
                  "flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-colors",
                  isCompareSelected
                    ? "bg-white text-indigo-700"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/20",
                  !canAdd && !isCompareSelected && "opacity-50 cursor-not-allowed"
                )}
                disabled={!canAdd && !isCompareSelected}
              >
                <GitCompareArrowsIcon className="w-4 h-4" />
                {isCompareSelected ? "Remove" : "Compare"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      {latestPlacement && (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { label: "Avg. Package", value: formatLPA(latestPlacement.avgPackageLpa), icon: TrophyIcon },
              { label: "Highest Package", value: formatLPA(latestPlacement.highestPackageLpa), icon: StarIcon },
              { label: "Placement Rate", value: `${latestPlacement.placementPercentage.toFixed(0)}%`, icon: UsersIcon },
              { label: "Annual Fees", value: `${formatINR(college.feesMin)} – ${formatINR(college.feesMax)}`, icon: GlobeIcon },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label}>
                <Icon className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky tab bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => scrollToTab(tab)}
              className={cn(
                "flex-shrink-0 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors",
                activeTab === tab
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              )}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Overview */}
        <section ref={(el) => { tabRefs.current.overview = el; }} id="overview">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Overview</h2>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <p className="text-slate-700 leading-relaxed">{college.overview}</p>

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {[
                { label: "Location", value: `${college.city}, ${college.state}` },
                { label: "Established", value: college.establishedYear.toString() },
                { label: "Type", value: TYPE_LABEL[college.type] },
                { label: "Stream", value: college.stream },
                { label: "NAAC Grade", value: college.accreditation ?? "Not graded" },
                { label: "Annual Fees Range", value: `${formatINR(college.feesMin)} – ${formatINR(college.feesMax)}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium text-slate-900">{value}</span>
                </div>
              ))}
            </div>

            {topRecruiters.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-700 mb-2">Top Recruiters</p>
                <div className="flex flex-wrap gap-2">
                  {topRecruiters.map((r) => (
                    <span key={r} className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Courses */}
        <section ref={(el) => { tabRefs.current.courses = el; }} id="courses">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Courses Offered</h2>
          {college.courses.length === 0 ? (
            <p className="text-slate-500">No course information available.</p>
          ) : (
            <div className="space-y-3">
              {college.courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-indigo-200 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900">{course.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          {course.degree}
                        </span>
                        <span className="text-xs text-slate-500">
                          {course.durationYears} year{course.durationYears !== 1 ? "s" : ""}
                        </span>
                        <span className="text-xs text-slate-500">
                          {course.seatsAvailable} seats
                        </span>
                      </div>
                    </div>
                    <div className="text-right sm:text-right flex-shrink-0">
                      <p className="font-bold text-slate-900">{formatINR(course.totalFees)}</p>
                      <p className="text-xs text-slate-500">Total fees</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    <span className="font-medium">Eligibility:</span> {course.eligibility}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Placements */}
        <section ref={(el) => { tabRefs.current.placements = el; }} id="placements">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Placement Statistics</h2>
          {college.placements.length === 0 ? (
            <p className="text-slate-500">No placement data available.</p>
          ) : (
            <div className="space-y-4">
              {college.placements.map((p) => {
                const recruiters: string[] = JSON.parse(p.topRecruiters) as string[];
                return (
                  <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4">
                      {p.year} Batch
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      {[
                        { label: "Avg. Package", value: `${p.avgPackageLpa.toFixed(1)} LPA` },
                        { label: "Median Package", value: `${p.medianPackageLpa.toFixed(1)} LPA` },
                        { label: "Highest Package", value: `${p.highestPackageLpa.toFixed(1)} LPA` },
                        { label: "Placement %", value: `${p.placementPercentage.toFixed(0)}%` },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-slate-50 rounded-xl p-3">
                          <p className="text-lg font-bold text-indigo-600">{value}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>
                    {recruiters.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-slate-500 mb-2">Top Recruiters</p>
                        <div className="flex flex-wrap gap-2">
                          {recruiters.map((r) => (
                            <span key={r} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Reviews */}
        <section ref={(el) => { tabRefs.current.reviews = el; }} id="reviews">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Student Reviews
            <span className="ml-2 text-sm font-normal text-slate-500">({college.totalReviews})</span>
          </h2>

          {/* Review Form */}
          <ReviewForm collegeSlug={college.slug} />

          {/* Reviews list */}
          {college.reviews.length === 0 ? (
            <p className="text-slate-500 mt-6">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-4 mt-6">
              {college.reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                          {review.user?.name?.[0]?.toUpperCase() ?? "A"}
                        </div>
                        <span className="font-medium text-slate-900 text-sm">
                          {review.user?.name ?? "Anonymous"}
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-900 mt-2">{review.title}</h4>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200 fill-slate-200"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mt-2 leading-relaxed">{review.body}</p>
                  <p className="text-xs text-slate-400 mt-3">
                    {new Date(review.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
