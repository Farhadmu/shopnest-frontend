"use client";

import React, { useMemo, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@heroui/react";
import {
  FiStar,
  FiThumbsUp,
  FiFlag,
  FiCheckCircle,
  FiEdit3,
  FiUploadCloud,
  FiX,
  FiAlertCircle,
  FiLoader,
  FiImage,
} from "react-icons/fi";
import { addProductReview, type Review } from "@/lib/api/reviews";
import { uploadImageToImgBB } from "@/lib/utils/imgbb";
import { useSession } from "@/lib/auth-client";

export interface ProductReviewsSectionProps {
  productId: string;
  initialReviews: Review[];
}

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center text-amber-400">
      {[1, 2, 3, 4, 5].map((n) => (
        <FiStar
          key={n}
          size={size}
          className={n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-border"}
        />
      ))}
    </div>
  );
}

export function ProductReviewsSection({ productId, initialReviews }: ProductReviewsSectionProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [filter, setFilter] = useState<"all" | "images" | "verified">("all");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const total = reviews.length;
  const average = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;

  const activeRating = hoverRating !== null ? hoverRating : rating;

  const breakdown = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const r of reviews) {
      const idx = Math.min(5, Math.max(1, Math.round(r.rating))) - 1;
      counts[idx] += 1;
    }
    return counts
      .map((count, idx) => ({
        stars: idx + 1,
        count,
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .reverse();
  }, [reviews, total]);

  const visibleReviews = reviews.filter((r) => {
    if (filter === "images") return !!r.images && r.images.length > 0;
    if (filter === "verified") return !!r.verifiedPurchase;
    return true;
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Reset so the user can pick again if desired
    e.target.value = "";

    const availableSlots = 4 - uploadedImages.length;
    if (availableSlots <= 0) {
      setUploadError("Maximum 4 photos allowed per review.");
      return;
    }

    const filesToUpload = files.slice(0, availableSlots);
    setUploading(true);
    setUploadError(null);

    try {
      const results = await Promise.all(
        filesToUpload.map((file) => uploadImageToImgBB(file).then((res) => res.url))
      );
      setUploadedImages((prev) => [...prev, ...results]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image. Please try again.";
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim()) return;

    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);

    try {
      const created = await addProductReview(productId, {
        rating,
        comment: `${title.trim()}. ${comment.trim()}`,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
      });

      setReviews((prev) => [created, ...prev]);
      setTitle("");
      setComment("");
      setRating(5);
      setHoverRating(null);
      setUploadedImages([]);
      setUploadError(null);
      setFormSuccess("Thank you! Your review has been submitted successfully.");

      setTimeout(() => {
        setFormSuccess(null);
      }, 5000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to submit your review. Please make sure you are logged in and try again.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex flex-col gap-8">
      {/* Summary Header */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border pb-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary">Community Validation</span>
            <h2 className="text-lg font-black text-text sm:text-xl">Customer Reviews &amp; Experiences ({total})</h2>
            <p className="mt-0.5 text-xs text-muted">Verified feedback from ShopNest buyers.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-4 pt-4 lg:grid-cols-12">
          <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-muted-bg p-4 text-center lg:col-span-4">
            <span className="text-3xl font-black leading-none text-text">{average.toFixed(1)}</span>
            <Stars value={average} size={18} />
            <span className="text-[11px] text-muted">Based on {total} verified rating{total === 1 ? "" : "s"}</span>
          </div>

          <div className="flex flex-col gap-1.5 lg:col-span-8">
            {breakdown.map(({ stars, pct }) => (
              <div key={stars} className="flex items-center gap-3">
                <span className="w-14 text-xs font-bold text-text">{stars} Stars</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted-bg">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-10 text-right text-xs text-muted">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Write a review form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <FiEdit3 className="text-primary" size={16} />
            <h3 className="text-sm font-black text-text">Write a Product Review</h3>
          </div>
          {!session?.user && (
            <span className="text-xs text-muted">
              <Link href={`/login?next=${encodeURIComponent(pathname || "")}`} className="font-bold text-primary hover:underline">
                Sign in
              </Link>{" "}
              to review as a verified buyer
            </span>
          )}
        </div>

        {formSuccess && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <FiCheckCircle size={15} className="shrink-0" />
            <span>{formSuccess}</span>
          </div>
        )}

        {formError && (
          <div className="flex items-center gap-2 rounded-xl border border-error/20 bg-error/10 p-2.5 text-xs font-bold text-error">
            <FiAlertCircle size={15} className="shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Field 1: Interactive Star Rating (~8px gap) */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-text">Overall Experience Rating</label>
          <div className="flex flex-wrap items-center gap-2.5">
            <div
              className="flex items-center gap-1"
              onMouseLeave={() => setHoverRating(null)}
              role="radiogroup"
              aria-label="Star rating"
            >
              {[1, 2, 3, 4, 5].map((n) => {
                const isFilled = n <= activeRating;
                return (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`Rate ${n} of 5 stars - ${RATING_LABELS[n]}`}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    className="group relative cursor-pointer p-0.5 transition-transform hover:scale-125 active:scale-95 focus:outline-none"
                  >
                    <FiStar
                      size={24}
                      className={`transition-all duration-150 ${
                        isFilled
                          ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                          : "text-border hover:text-amber-300"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <FiStar size={12} className="fill-current" />
              {activeRating} {activeRating === 1 ? "Star" : "Stars"} &middot; {RATING_LABELS[activeRating] || ""}
            </span>
          </div>
        </div>

        {/* Field 2: Review Headline (~8px gap) */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-text" htmlFor="review-title">
            Review Headline
          </label>
          <input
            id="review-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Excellent build quality, sounds amazing!"
            required
            className="rounded-lg bg-muted-bg px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Field 3: Detailed Feedback (~8px gap) */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-text" htmlFor="review-content">
            Detailed Feedback
          </label>
          <textarea
            id="review-content"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell other shoppers about the material quality, packaging, delivery time, and seller experience..."
            required
            rows={3}
            className="rounded-lg bg-muted-bg p-3 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Field 4: Image Upload (Optional) (~8px gap) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FiImage size={15} className="text-primary" />
              <label className="text-xs font-bold text-text">
                Product Photos <span className="font-normal text-muted">(Optional)</span>
              </label>
            </div>
            <span className="text-[11px] text-muted">
              {uploadedImages.length}/4 photos uploaded
            </span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
          />

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {/* Uploaded image previews */}
            {uploadedImages.map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                className="group relative h-20 w-20 overflow-hidden rounded-xl border border-border bg-muted-bg shadow-xs"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Review thumbnail ${idx + 1}`}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  aria-label="Remove photo"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/75 text-white shadow-xs transition-colors hover:bg-error"
                >
                  <FiX size={13} />
                </button>
              </div>
            ))}

            {/* Uploading loading indicator */}
            {uploading && (
              <div className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-primary/50 bg-primary/5 text-primary">
                <FiLoader size={20} className="animate-spin" />
                <span className="text-[10px] font-bold">Uploading...</span>
              </div>
            )}

            {/* Add photos trigger button */}
            {uploadedImages.length < 4 && !uploading && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-20 w-32 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-muted-bg/60 p-2 text-center transition-colors hover:border-primary/50 hover:bg-muted-bg focus:outline-none cursor-pointer"
              >
                <FiUploadCloud size={20} className="text-primary" />
                <span className="text-[11px] font-bold text-text">Add Photos</span>
                <span className="text-[9px] text-muted">Max 4 images</span>
              </button>
            )}
          </div>

          {uploadError && (
            <p className="flex items-center gap-1 text-xs font-semibold text-error">
              <FiAlertCircle size={13} /> {uploadError}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-[11px] text-muted">
            Photos will be verified and displayed to other shoppers.
          </p>
          <Button
            type="submit"
            variant="primary"
            isDisabled={submitting || uploading}
            className="rounded-lg px-6 py-2.5 text-sm font-bold text-white"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </form>

      {/* Filters + Reviews list */}
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
        <div className="flex flex-wrap gap-2 pt-1">
          {review.images.map((src, idx) => (
            <div
              key={`${src}-${idx}`}
              className="h-20 w-20 overflow-hidden rounded-xl border border-border bg-muted-bg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Review photo ${idx + 1}`}
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-3 text-xs font-semibold text-muted">
        <button
          type="button"
          onClick={() => setHelpful((h) => h + 1)}
          className="flex items-center gap-1.5 rounded-lg bg-muted-bg px-3 py-1.5 hover:bg-border/60 cursor-pointer"
        >
          <FiThumbsUp size={13} /> Helpful ({helpful})
        </button>
        <button type="button" className="flex items-center gap-1 hover:text-text cursor-pointer">
          <FiFlag size={13} /> Report
        </button>
      </div>
    </article>
  );
}