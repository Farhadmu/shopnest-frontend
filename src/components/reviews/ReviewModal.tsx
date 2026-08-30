"use client";

import React, { useState } from "react";
import { FiStar, FiX, FiCheck, FiUploadCloud } from "react-icons/fi";
import { clientMutation } from "@/lib/core/client";

interface ReviewModalProps {
  productId: string;
  productTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReviewModal({
  productId,
  productTitle,
  isOpen,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Please write a few words about your experience with this product.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = new FormData();
      payload.append("rating", String(rating));
      payload.append("comment", comment.trim());
      if (title.trim()) payload.append("title", title.trim());
      imageFiles.forEach((file) => payload.append("images", file));
      await clientMutation(`/products/${productId}/reviews`, "POST", payload);

      setIsDone(true);
      setTimeout(() => {
        setIsDone(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-2xl relative text-foreground">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted hover:text-foreground rounded-full hover:bg-muted-bg transition-colors"
        >
          <FiX className="text-xl" />
        </button>

        {isDone ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
              <FiCheck />
            </div>
            <h3 className="text-xl font-bold">Review Submitted!</h3>
            <p className="text-sm text-muted mt-1">
              Thank you for helping other buyers make informed decisions.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Product Review
              </span>
              <h3 className="text-lg font-extrabold text-foreground mt-0.5 line-clamp-1">
                {productTitle || "Review Product"}
              </h3>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-2">Overall Rating *</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                  >
                    <FiStar
                      className={`${
                        (hoverRating || rating) >= star
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted border-border"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-foreground">
                  {rating === 5
                    ? "Excellent ⭐⭐⭐⭐⭐"
                    : rating === 4
                    ? "Good ⭐⭐⭐⭐"
                    : rating === 3
                    ? "Average ⭐⭐⭐"
                    : rating === 2
                    ? "Poor ⭐⭐"
                    : "Terrible ⭐"}
                </span>
              </div>
            </div>

            {/* Review Title */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">
                Headline / Short Summary (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Great quality, fast delivery!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Detailed Comment */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">
                Detailed Review *
              </label>
              <textarea
                rows={3}
                placeholder="What did you like or dislike? How was the fit, material, or packaging?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Product photos */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 flex items-center gap-1.5">
                <FiUploadCloud /> Product photos (Optional, up to 5 images)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => setImageFiles(Array.from(event.target.files ?? []).slice(0, 5))}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-2.5 file:py-1.5 file:text-xs file:font-bold file:text-primary"
              />
              {imageFiles.length > 0 && <p className="mt-1.5 text-[11px] text-muted">{imageFiles.length} photo{imageFiles.length > 1 ? "s" : ""} selected. Each file must be an image within the platform upload limit.</p>}
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-foreground hover:bg-muted-bg border border-border transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs shadow-md shadow-primary/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Post Review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
