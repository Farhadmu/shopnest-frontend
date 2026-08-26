"use client";

import React from "react";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Clock,
  Heart,
} from "lucide-react";
import { Seller } from "./seller.types";

interface SellerCardProps {
  seller: Seller;
  isFollowed?: boolean;
  onToggleFollow?: (id: string) => void;
}

export default function SellerCard({
  seller,
  isFollowed = false,
  onToggleFollow,
}: SellerCardProps) {
  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFollow?.(seller.id);
  };

  return (
    <div className="group relative flex w-[310px] sm:w-[350px] shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-5.5 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
      {/* Top Accent Gradient Bar */}
      <div
        className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${seller.gradient} opacity-85 group-hover:opacity-100 transition-opacity`}
      />

      {/* Hover Glow Backdrop */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-25"
        style={{ background: seller.glowColor }}
      />

      {/* Card Header & Bio */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            {/* Avatar with Live Status Indicator */}
            <div className="relative">
              <div
                className={`grid h-13 w-13 place-items-center rounded-2xl bg-gradient-to-br ${seller.gradient} text-base font-black tracking-wide text-white shadow-md`}
              >
                {seller.initials}
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-surface">
                <span className="h-2.5 w-2.5 rounded-full bg-success ring-2 ring-surface animate-pulse" />
              </span>
            </div>

            {/* Store Name & Category */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-sm sm:text-base font-black text-text group-hover:text-primary transition-colors">
                  {seller.name}
                </h3>
                <span title="Verified Merchant" className="inline-flex">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                </span>
              </div>
              <p className="truncate text-xs font-medium text-muted mt-0.5">
                {seller.category}
              </p>
            </div>
          </div>

          {/* Follow Button */}
          <button
            type="button"
            onClick={handleFollowClick}
            title={isFollowed ? "Following store" : "Follow store"}
            className={`grid h-8.5 w-8.5 shrink-0 place-items-center rounded-xl border transition-all duration-200 ${
              isFollowed
                ? "border-rose-500/30 bg-rose-500/10 text-rose-500"
                : "border-border bg-muted-bg/50 text-muted hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-500"
            }`}
          >
            <Heart
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                isFollowed ? "fill-rose-500 scale-110" : ""
              }`}
            />
          </button>
        </div>

        {/* Tagline */}
        <p className="mt-3 text-xs leading-relaxed text-muted line-clamp-2 min-h-[34px]">
          {seller.tagline}
        </p>

        {/* Key Metrics Strip */}
        <div className="mt-3.5 flex items-center justify-between gap-2 border-y border-border/50 py-2.5 text-xs">
          {/* Star Rating */}
          <div className="flex items-center gap-1 font-bold text-amber-500">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-text font-black">{seller.rating}</span>
            <span className="text-[11px] font-medium text-muted">({seller.reviewsCount})</span>
          </div>

          {/* Sales Volume */}
          <div className="flex items-center gap-1 text-muted font-medium">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span className="font-bold text-text">{seller.sales}</span>
          </div>

          {/* Positive Review Rate */}
          <div className="flex items-center gap-1 text-success font-bold text-[11px]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{seller.positiveRate}</span>
          </div>
        </div>

        {/* Specialty Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {seller.featuredTags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-muted-bg/80 px-2 py-0.5 text-[10px] font-semibold text-muted transition-colors group-hover:bg-muted-bg"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="mt-4 pt-3 flex items-center justify-between border-t border-border/40">
        <div className="flex items-center gap-1 text-[11px] font-medium text-muted">
          <Clock className="h-3 w-3 text-muted" />
          <span>Avg reply {seller.responseTime}</span>
        </div>

        <Link
          href={`/stores/${seller.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-black text-primary transition-colors hover:text-primary-hover"
        >
          <span>Visit Store</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
