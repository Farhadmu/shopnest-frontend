"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Flame,
  Timer,
  ArrowRight,
  Zap,
  Tag,
  CheckCircle2,
  Copy,
  TrendingDown,
  ShoppingBag,
  Percent,
  Clock,
  Calendar,
} from "lucide-react";

interface DealCard {
  id: string;
  badge: string;
  discount: string;
  title: string;
  subtitle: string;
  category: string;
  code: string;
  startTime: string; // ISO / parseable timestamp
  endTime: string;   // ISO / parseable timestamp
  startDisplay: string; // Human readable start time
  endDisplay: string;   // Human readable end time
  claimedPercent: number;
  accentGradient: string;
  iconBg: string;
  href: string;
}

const DEALS: DealCard[] = [
  {
    id: "tech-drop",
    badge: "Flash Drop",
    discount: "Up to 45% OFF",
    title: "Weekend Tech & Gadget Drop",
    subtitle: "Noise-cancelling headphones, mechanical keyboards & fast chargers.",
    category: "Electronics",
    code: "TECH45",
    startTime: "2026-08-25T08:00:00",
    endTime: "2026-08-26T23:59:59",
    startDisplay: "Aug 25, 08:00 AM",
    endDisplay: "Aug 27, 11:59 PM",
    claimedPercent: 84,
    accentGradient: "from-blue-600/20 via-indigo-500/10 to-transparent",
    iconBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    href: "/products?category=Electronics",
  },
  {
    id: "home-refresh",
    badge: "Limited Stock",
    discount: "Save $80",
    title: "Smart Living & Home Refresh",
    subtitle: "Ergonomic desk accessories, ambient lighting & smart kitchen gear.",
    category: "Home & Office",
    code: "HOME80",
    startTime: "2026-08-24T12:00:00",
    endTime: "2026-08-28T18:00:00",
    startDisplay: "Aug 24, 12:00 PM",
    endDisplay: "Aug 28, 06:00 PM",
    claimedPercent: 62,
    accentGradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    href: "/products?category=Home",
  },
  {
    id: "style-edit",
    badge: "Members Pick",
    discount: "Extra 25% OFF",
    title: "Seasonal Apparel & Footwear",
    subtitle: "Minimalist waterproof outerwear, sneakers, and commuter packs.",
    category: "Fashion",
    code: "STYLE25",
    startTime: "2026-08-26T09:00:00",
    endTime: "2026-08-29T23:59:59",
    startDisplay: "Aug 26, 09:00 AM",
    endDisplay: "Aug 29, 11:59 PM",
    claimedPercent: 91,
    accentGradient: "from-rose-500/20 via-pink-500/10 to-transparent",
    iconBg: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    href: "/products?category=Fashion",
  },
];

function formatDigit(num: number): string {
  return String(num).padStart(2, "0");
}

function calculateSecondsRemaining(endTime: string): number {
  const target = new Date(endTime).getTime();
  if (isNaN(target)) return 0;
  const diff = Math.floor((target - Date.now()) / 1000);
  return diff > 0 ? diff : 0;
}

// Reusable countdown timer component for individual cards
function CardCountdown({ endTime }: { endTime: string }) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const update = () => {
      setSecondsLeft(calculateSecondsRemaining(endTime));
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="flex items-center gap-1 font-mono text-xs font-bold text-warm" suppressHydrationWarning>
      <Clock className="w-3.5 h-3.5" />
      <span>
        {formatDigit(hours)}h {formatDigit(minutes)}m {formatDigit(seconds)}s
      </span>
    </div>
  );
}

export default function DealsSection() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const primaryDealEndTime = DEALS[0]?.endTime;
  const [headerSecondsLeft, setHeaderSecondsLeft] = useState(0);

  useEffect(() => {
    const update = () => {
      if (primaryDealEndTime) {
        setHeaderSecondsLeft(calculateSecondsRemaining(primaryDealEndTime));
      }
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [primaryDealEndTime]);

  const handleCopyCode = (e: React.MouseEvent, code: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const headerHours = Math.floor(headerSecondsLeft / 3600);
  const headerMinutes = Math.floor((headerSecondsLeft % 3600) / 60);
  const headerSeconds = headerSecondsLeft % 60;

  return (
    <section className="py-8">
      {/* Header with Live Countdown */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-warm/30 bg-warm/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-warm">
              <Flame className="w-3.5 h-3.5 fill-warm animate-pulse" />
              <span>Limited Time Offers</span>
            </span>

            {/* Live Ticker Clock */}
            <div className="flex items-center gap-1 rounded-full border border-border bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-xs backdrop-blur-sm" suppressHydrationWarning>
              <Timer className="w-3.5 h-3.5 text-primary" />
              <span className="text-muted text-[11px]">Ends in:</span>
              <span className="font-mono font-bold text-primary">
                {formatDigit(headerHours)}:{formatDigit(headerMinutes)}:{formatDigit(headerSeconds)}
              </span>
            </div>
          </div>

          <h2 className="mt-2.5 text-3xl font-black tracking-tight text-text sm:text-4xl">
            Deals worth grabbing today
          </h2>
          <p className="mt-1 text-sm text-muted">
            Verified price drops, bundle discounts, and instant coupon codes.
          </p>
        </div>

        <Link
          href="/products"
          className="group inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-hover transition-colors"
        >
          <span>Explore all promotions</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* 3 High-Impact Interactive Deal Cards */}
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {DEALS.map((deal) => (
          <motion.div
            key={deal.id}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-xl dark:shadow-none"
          >
            {/* Gradient Glow */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${deal.accentGradient} opacity-60 pointer-events-none transition-opacity duration-300 group-hover:opacity-100`}
            />

            <div>
              {/* Card Top */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${deal.iconBg}`}>
                  <Zap className="w-3 h-3" /> {deal.badge}
                </span>

                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-black text-primary">
                  <Percent className="w-3 h-3" /> {deal.discount}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="relative z-10 mt-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  {deal.category}
                </span>
                <h3 className="mt-1 text-xl font-black text-text leading-snug group-hover:text-primary transition-colors">
                  {deal.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted font-medium">
                  {deal.subtitle}
                </p>
              </div>

              {/* Coupon Code Pill */}
              <div className="relative z-10 mt-4 flex items-center justify-between rounded-xl border border-border/80 bg-muted-bg/60 p-2 text-xs">
                <div className="flex items-center gap-1.5 text-muted">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] font-medium">Code:</span>
                  <span className="font-mono font-bold text-text tracking-wider">{deal.code}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleCopyCode(e, deal.code)}
                  className="inline-flex items-center gap-1 rounded-lg bg-surface px-2.5 py-1 text-[11px] font-bold text-text shadow-xs hover:text-primary transition-all active:scale-95 border border-border"
                >
                  {copiedCode === deal.code ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Exact Coupon Schedule: Start & End Time */}
              <div className="relative z-10 mt-2.5 flex items-center justify-between gap-1.5 rounded-xl border border-border/60 bg-muted-bg/40 px-2.5 py-1.5 text-[11px] font-medium text-muted">
                <span className="flex items-center gap-1 truncate">
                  <Calendar className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="text-[10px] text-muted font-normal">Start:</span>
                  <span className="font-semibold text-text">{deal.startDisplay}</span>
                </span>
                <span className="text-border shrink-0">•</span>
                <span className="flex items-center gap-1 truncate">
                  <Clock className="w-3 h-3 text-warm shrink-0" />
                  <span className="text-[10px] text-muted font-normal">End:</span>
                  <span className="font-semibold text-text">{deal.endDisplay}</span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative z-10 mt-4 space-y-1.5">
                <div className="flex justify-between text-[11px] font-medium text-muted">
                  <span>Claimed: {deal.claimedPercent}%</span>
                  <span className="flex items-center gap-1 font-semibold text-warm">
                    <TrendingDown className="w-3 h-3" /> High demand
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted-bg">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-warm transition-all duration-500"
                    style={{ width: `${deal.claimedPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action Footer: Live Card Specific Countdown Timer */}
            <div className="relative z-10 mt-6 pt-4 border-t border-border/70 flex items-center justify-between">
              <CardCountdown endTime={deal.endTime} />

              <Link
                href={deal.href}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-surface shadow-xs transition-all hover:bg-primary-hover hover:gap-2 active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Shop Deal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}