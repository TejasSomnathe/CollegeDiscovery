"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StarIcon } from "lucide-react";
import { reviewSchema } from "@/lib/validations";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Props {
  collegeSlug: string;
}

export function ReviewForm({ collegeSlug }: Props) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/colleges/${collegeSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, title, body }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: { message: string } };
        throw new Error(data.error?.message ?? "Failed to submit review");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      setRating(0);
      setTitle("");
      setBody("");
      setErrors([]);
      queryClient.invalidateQueries({ queryKey: ["college", collegeSlug] });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const parsed = reviewSchema.safeParse({ rating, title, body });
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((i) => i.message));
      return;
    }

    mutation.mutate();
  };

  if (!session?.user) {
    return (
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-center">
        <p className="text-slate-700 font-medium">Want to leave a review?</p>
        <p className="text-slate-500 text-sm mt-1 mb-3">Sign in to share your experience</p>
        <Link
          href="/auth/login"
          className="inline-block bg-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
    >
      <h3 className="font-bold text-slate-900 mb-4">Write a Review</h3>

      {/* Star rating */}
      <div className="mb-4">
        <label className="text-sm font-medium text-slate-700 block mb-2">Your Rating *</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-0.5"
            >
              <StarIcon
                className={cn(
                  "w-7 h-7 transition-colors",
                  star <= (hoverRating || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300 fill-slate-100"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="mb-3">
        <label className="text-sm font-medium text-slate-700 block mb-1">Review Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {/* Body */}
      <div className="mb-4">
        <label className="text-sm font-medium text-slate-700 block mb-1">Detailed Review *</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="Share your detailed experience about academics, placements, campus life..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
        />
        <p className="text-xs text-slate-400 mt-1">{body.length}/2000</p>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3">
          {errors.map((e) => (
            <p key={e} className="text-sm text-red-700">{e}</p>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60"
      >
        {mutation.isPending && <Spinner className="w-4 h-4" />}
        Submit Review
      </button>
    </form>
  );
}
