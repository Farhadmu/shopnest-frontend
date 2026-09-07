"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@heroui/react";
import { FiStar, FiThumbsUp, FiFlag, FiCheckCircle, FiEdit3 } from "react-icons/fi";
import { addProductReview, type Review } from "@/lib/api/reviews";

export interface ProductReviewsSectionProps {
  productId: string;
  initialReviews: Review[];
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center text-amber-400">
      {[1, 2, 3, 4, 5].map((n) => (
        <FiStar key={n} size={size} className={n <= Math.round(value) ? "fill-amber-400" : "text-border"} />
      ))}
    </div>
  );
}

export function ProductReviewsSection({ productId, initialReviews }: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [filter, setFilter] = useState<"all" | "images" | "verified">("all");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const total = reviews.length;
  const average = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;

  const breakdown = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const r of reviews) {
      const idx = Math.min(5, Math.max(1, Math.round(r.rating))) - 1;
      counts[idx] += 1;
    }
    return counts
      .map((count, idx) => ({ stars: idx + 1, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }))
      .reverse();
  }, [reviews, total]);

  const visibleReviews = reviews.filter((r) => {
    if (filter === "images") return !!r.images && r.images.length > 0;
    if (filter === "verified") return !!r.verifiedPurchase;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim()) return;

    setSubmitting(true);
    try {
      const created = await addProductReview(productId, { rating, comment: `${title.trim()}. ${comment.trim()}` });
      setReviews((prev) => [created, ...prev]);
      setTitle("");
      setComment("");
      setRating(5);
    } catch {
      // TODO: surface a proper error toast once a shared toast provider exists.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex flex-col gap-6">
      {/* Summary */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary">Community Validation</span>
            <h2 className="text-xl font-black text-text sm:text-2xl">Customer Reviews &amp; Experiences ({total})</h2>
            <p className="mt-1 text-sm text-muted">Verified feedback from ShopNest buyers.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-6 pt-5 lg:grid-cols-12">
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-muted-bg p-6 text-center lg:col-span-4">
            <span className="text-4xl font-black leading-none text-text">{average.toFixed(1)}</span>
            <Stars value={average} size={20} />
            <span className="text-xs text-muted">Based on {total} verified rating{total === 1 ? "" : "s"}</span>
          </div>

          <div className="flex flex-col gap-2 lg:col-span-8">
            {breakdown.map(({ stars, pct }) => (
              <div key={stars} className="flex items-center gap-3">
                <span className="w-14 text-xs font-bold text-text">{stars} Stars</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted-bg">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-10 text-right text-xs text-muted">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Write a review */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <FiEdit3 className="text-primary" size={18} />
          <h3 className="text-base font-black text-text">Write a Product Review</h3>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text">Overall Experience Rating</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} className="p-1">
                <FiStar size={24} className={n <= rating ? "fill-amber-400 text-amber-400" : "text-border"} />
              </button>
            ))}
            <span className="ml-2 text-sm font-bold text-primary">{rating} Stars</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text" htmlFor="review-title">
            Review Headline
          </label>
          <input
            id="review-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Great quality and fast delivery"
            required
            className="rounded-lg bg-muted-bg px-3.5 py-2.5 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text" htmlFor="review-content">
            Detailed Feedback
          </label>
          <textarea
            id="review-content"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell other shoppers about the build quality, delivery, and seller experience..."
            required
            rows={4}
            className="rounded-lg bg-muted-bg p-3.5 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <Button type="submit" variant="primary" isDisabled={submitting} className="self-end rounded-lg px-6 py-2.5 text-sm font-bold text-white">
          {submitting ? "Submitting..." : "Submit Review"}
        </Button>
      </form>

      {/* Filters + list */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-surface p-3 shadow-sm">
          {(["all", "images", "verified"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${
                filter === key ? "bg-primary text-white" : "bg-muted-bg text-text hover:bg-border/60"
              }`}
            >
              {key === "all" ? `All Reviews (${total})` : key === "images" ? "With Images" : "Verified Purchases"}
            </button>
          ))}
        </div>

        {visibleReviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            No reviews to show yet — be the first to leave feedback.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {visibleReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [helpful, setHelpful] = useState(0);

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-muted-bg text-sm font-bold text-primary">
            {(review.userName || "U").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-text">{review.userName || "ShopNest Buyer"}</span>
              {review.verifiedPurchase && (
                <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  <FiCheckCircle size={10} /> Verified
                </span>
              )}
            </div>
            <span className="text-xs text-muted">{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <Stars value={review.rating} />
      </div>

      {review.title && <h4 className="text-sm font-bold text-text">{review.title}</h4>}
      <p className="text-sm leading-relaxed text-muted">{review.comment}</p>

      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 pt-1">
          {review.images.map((src, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={`${src}-${idx}`} src={src} alt={`Review photo ${idx + 1}`} className="h-20 w-20 rounded-lg object-cover" />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-3 text-xs font-semibold text-muted">
        <button type="button" onClick={() => setHelpful((h) => h + 1)} className="flex items-center gap-1.5 rounded-lg bg-muted-bg px-3 py-1.5 hover:bg-border/60">
          <FiThumbsUp size={13} /> Helpful ({helpful})
        </button>
        <button type="button" className="flex items-center gap-1 hover:text-text">
          <FiFlag size={13} /> Report
        </button>
      </div>
    </article>
  );
}