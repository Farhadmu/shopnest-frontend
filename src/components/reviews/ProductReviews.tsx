"use client";

import { useEffect, useState } from "react";
import { FiCheckCircle, FiImage, FiStar } from "react-icons/fi";
import { getProductReviews, type Review as ProductReview } from "@/lib/api/reviews";

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    getProductReviews(productId)
      .then((items) => {
        if (isCurrent) setReviews(items);
      })
      .catch(() => {
        if (isCurrent) setReviews([]);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [productId]);

  return (
    <section className="border-t border-border/60 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-foreground">Customer reviews</h3>
          <p className="mt-1 text-sm text-muted">Verified feedback from ShopNest buyers.</p>
        </div>
        <span className="text-sm font-bold text-primary">{reviews.length} review{reviews.length === 1 ? "" : "s"}</span>
      </div>
      {isLoading ? (
        <div className="mt-5 rounded-2xl bg-muted-bg p-5 text-sm text-muted">Loading customer feedback...</div>
      ) : reviews.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-border p-5 text-sm text-muted">No customer review yet. Delivered buyers can be the first to share feedback.</div>
      ) : (
        <div className="mt-5 grid gap-4">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-500" aria-label={`${review.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((star) => <FiStar key={star} className={star <= review.rating ? "fill-amber-400" : "text-border"} />)}
                  </div>
                  {review.title && <h4 className="mt-2 text-sm font-black">{review.title}</h4>}
                  <p className="mt-2 text-sm leading-6 text-muted">{review.comment}</p>
                </div>
                <div className="shrink-0 text-xs text-muted sm:text-right">
                  <p className="font-bold text-foreground">{review.userName}</p>
                  {review.verifiedPurchase && <p className="mt-1 inline-flex items-center gap-1 font-semibold text-success"><FiCheckCircle /> Verified delivery</p>}
                  <p className="mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {review.images && review.images.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {review.images.map((image, index) => <a key={`${image}-${index}`} href={image} target="_blank" rel="noreferrer" className="group relative block h-20 w-20 overflow-hidden rounded-xl border border-border"><img src={image} alt={`Customer review photo ${index + 1}`} className="h-full w-full object-cover transition-transform group-hover:scale-105" /><FiImage className="absolute bottom-1 right-1 rounded bg-black/60 p-0.5 text-white" /></a>)}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
