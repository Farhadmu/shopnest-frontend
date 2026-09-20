"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { FaStar } from "react-icons/fa";
import { getPlatformStats, PlatformSampleReview } from "@/lib/api/platform";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.max(0, Math.round((now.getTime() - date.getTime()) / 1000));
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K+`;
  return `${n}+`;
}

export default function ProofSection() {
  const [stats, setStats] = useState<{
    avgRating: number;
    totalReviews: number;
    sampleReviews: PlatformSampleReview[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPlatformStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => setStats(null))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

 
  const reviews: PlatformSampleReview[] = stats?.sampleReviews ?? [];
  const marqueeReviews = reviews.length > 0 ? [...reviews, ...reviews] : [];

  const totalReviews = stats?.totalReviews ?? 0;

  return (
    <section className="w-full overflow-hidden rounded-3xl border border-border/50 bg-muted-bg py-10">
      <div className="text-center mb-8 px-4">
        <h2 className="text-3xl md:text-4xl font-black text-text tracking-tight">
          What Our Users Say
        </h2>
        <p className="mt-2 text-sm md:text-base text-muted max-w-xl mx-auto">
          Real stories from real shoppers who love ShopNest
        </p>
      </div>

      {/* Auto-moving marquee container */}
      <div className="relative w-full overflow-hidden flex">
        {loading || marqueeReviews.length === 0 ? (
          <div className="flex gap-4 w-full px-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-[260px] sm:w-[290px] lg:w-[320px] shrink-0 h-60 animate-pulse rounded-2xl border border-border bg-surface"
              />
            ))}
          </div>
        ) : (
          <motion.div
            className="flex gap-4 shrink-0"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 25,
            }}
            style={{ width: "max-content" }}
          >
            {marqueeReviews.map((review, index) => (
              <div
                key={`${review.id}-${index}`}
                className="w-[260px] sm:w-[290px] lg:w-[320px] group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm flex flex-col justify-between shrink-0 transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
              >
                {/* Purple hover glow matching the site theme */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-[1] rounded-2xl opacity-0 transition-all duration-500 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.15), transparent 70%)`,
                  }}
                />

                <div className="relative z-10">
                  <header className="flex items-center gap-3 mb-4">
{review.avatarUrl ? (
                    <img
                      src={review.avatarUrl}
                      alt={review.userName}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-12 w-12 rounded-full object-cover border-2 border-border ring-2 ring-primary/20"
                      onError={(e) => {
                      
                        const el = e.currentTarget;
                        el.style.display = "none";
                        const parent = el.parentElement;
                        if (parent && !parent.querySelector("[data-initials]")) {
                          const badge = document.createElement("div");
                          badge.dataset.initials = "1";
                          badge.className =
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary ring-2 ring-border";
                          badge.textContent = initials(review.userName);
                          parent.prepend(badge);
                        }
                      }}
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary ring-2 ring-border">
                      {initials(review.userName)}
                    </div>
                  )}
                    <div>
                      <p className="text-sm font-bold text-text">
                        {review.userName}
                      </p>
                      <time className="text-xs text-muted">
                        {getTimeAgo(review.createdAt)}
                      </time>
                    </div>
                  </header>

                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FaStar
                        key={i}
                        size={14}
                        className={i < review.rating ? "" : "opacity-30"}
                      />
                    ))}
                  </div>

                  <blockquote>
                    <p className="text-xs sm:text-sm leading-relaxed text-muted line-clamp-4 font-medium">
                      “{review.comment}”
                    </p>
                  </blockquote>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <div className="mt-8 text-center border-t border-border pt-6 px-4">
        <p className="text-sm text-muted font-medium">
          Join <span className="font-bold text-text">{formatCount(totalReviews)}</span> happy shoppers
        </p>
      </div>
    </section>
  );
}