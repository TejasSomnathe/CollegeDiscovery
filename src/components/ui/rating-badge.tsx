import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingBadgeProps {
  rating: number;
  totalReviews?: number;
  size?: "sm" | "md" | "lg";
}

export function RatingBadge({ rating, totalReviews, size = "md" }: RatingBadgeProps) {
  const color =
    rating >= 4.5
      ? "bg-emerald-500"
      : rating >= 4.0
      ? "bg-green-500"
      : rating >= 3.5
      ? "bg-yellow-500"
      : rating >= 3.0
      ? "bg-orange-400"
      : "bg-red-500";

  const textSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";
  const iconSize = size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4";

  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={cn(
          "inline-flex items-center gap-0.5 text-white font-bold px-1.5 py-0.5 rounded",
          color,
          textSize
        )}
      >
        <StarIcon className={cn(iconSize, "fill-white")} />
        {rating.toFixed(1)}
      </span>
      {totalReviews !== undefined && (
        <span className={cn("text-slate-500", size === "sm" ? "text-xs" : "text-sm")}>
          ({totalReviews})
        </span>
      )}
    </span>
  );
}
