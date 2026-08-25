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
  startTime: string;
  endTime: string;
  startDisplay: string;
  endDisplay: string;
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
    endTime: "2026-08-27T23:59:59",
    startDisplay: "Aug 25, 08:00 AM",
    endDisplay: "Aug 27, 11:59 PM",
    claimedPercent: 84,
    accentGradient: "from-primary/20 via-accent/10 to-transparent",
    iconBg: "bg-primary/15 text-primary border border-primary/20",
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
    accentGradient: "from-warm/20 via-warning/10 to-transparent",
    iconBg: "bg-warm/15 text-warm border border-warm/20",
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
    accentGradient: "from-accent/20 via-primary/10 to-transparent",
    iconBg: "bg-accent/15 text-accent border border-accent/20",
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

// Reusable animated countdown timer component for cards using design tokens
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
    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-warm" suppressHydrationWarning>
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Clock className="w-3.5 h-3.5 shrink-0" />
      </motion.div>
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
    <section className="py-6 sm:py-8 lg:py-10">
      {/* Animated Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-warm/30 bg-warm/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-warm shadow-xs">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex"
              >
                <Flame className="w-3.5 h-3.5 fill-warm" />
              </motion.span>
              <span>Limited Time Offers</span>
            </span>

            {/* Live Ticker Clock */}
            <div
              className="flex items-center gap-1.5 rounded-full border border-border bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-xs backdrop-blur-sm"
              suppressHydrationWarning
            >
              <Timer className="w-3.5 h-3.5 text-primary animate-spin animation-duration-[8s]" />
              <span className="text-muted text-[11px]">Ends in:</span>
              <span className="font-mono font-bold text-primary">
                {formatDigit(headerHours)}:{formatDigit(headerMinutes)}:{formatDigit(headerSeconds)}
              </span>
            </div>
          </div>

          <h2 className="mt-2.5 text-2xl font-black tracking-tight text-text sm:text-3xl lg:text-4xl">
            Deals worth grabbing today
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            Verified price drops, bundle discounts, and instant coupon codes.
          </p>
        </div>

        <Link
          href="/products"
          className="group inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary hover:text-primary-hover transition-colors shrink-0"
        >
          <span>Explore all promotions</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
        </Link>
      </motion.div>

      {/* Animated Responsive Grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {DEALS.map((deal, index) => (
          <motion.div
            key={deal.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.45,
              delay: index * 0.1,
              ease: "easeOut",
            }}
            whileHover={{ y: -6 }}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-xl dark:shadow-none ${
              index === 2 ? "sm:col-span-2 lg:col-span-1" : ""
            }`}
          >
            {/* Ambient Background Gradient Glow derived strictly from design tokens */}
            <motion.div
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
              className={`absolute inset-0 bg-linear-to-br ${deal.accentGradient} pointer-events-none transition-opacity duration-300 group-hover:opacity-100`}
            />

            <div>
              {/* Card Top: Badges & Discount Chip */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-transform duration-200 group-hover:scale-105 ${deal.iconBg}`}
                >
                  <Zap className="w-3 h-3" /> {deal.badge}
                </span>

                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-black text-primary backdrop-blur-xs"
                >
                  <Percent className="w-3 h-3" /> {deal.discount}
                </motion.span>
              </div>

              {/* Title & Subtitle */}
              <div className="relative z-10 mt-4 sm:mt-5">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted">
                  {deal.category}
                </span>
                <h3 className="mt-1 text-lg sm:text-xl font-black text-text leading-snug transition-colors duration-200 group-hover:text-primary">
                  {deal.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted font-medium line-clamp-2 sm:line-clamp-none">
                  {deal.subtitle}
                </p>
              </div>

              {/* Coupon Code Pill */}
              <div className="relative z-10 mt-4 flex items-center justify-between rounded-xl border border-border/80 bg-muted-bg/60 p-2 text-xs backdrop-blur-xs transition-colors group-hover:border-primary/30">
                <div className="flex items-center gap-1.5 text-muted">
                  <Tag className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-[11px] font-medium">Code:</span>
                  <span className="font-mono font-bold text-text tracking-wider">{deal.code}</span>
                </div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ scale: 1.04 }}
                  onClick={(e) => handleCopyCode(e, deal.code)}
                  className="inline-flex items-center gap-1 rounded-lg bg-surface px-2.5 py-1 text-[11px] font-bold text-text shadow-xs hover:text-primary transition-colors border border-border"
                >
                  {copiedCode === deal.code ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-success" />
                      <span className="text-success">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Exact Coupon Schedule: Start & End Time */}
              <div className="relative z-10 mt-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5 rounded-xl border border-border/60 bg-muted-bg/40 px-2.5 py-1.5 text-[10px] sm:text-[11px] font-medium text-muted transition-colors group-hover:border-primary/20">
                <span className="flex items-center gap-1 truncate">
                  <Calendar className="w-3 h-3 text-success shrink-0" />
                  <span className="text-[10px] text-muted font-normal">Start:</span>
                  <span className="font-semibold text-text truncate">{deal.startDisplay}</span>
                </span>
                <span className="text-border shrink-0 hidden sm:inline">•</span>
                <span className="flex items-center gap-1 truncate">
                  <Clock className="w-3 h-3 text-warm shrink-0" />
                  <span className="text-[10px] text-muted font-normal">End:</span>
                  <span className="font-semibold text-text truncate">{deal.endDisplay}</span>
                </span>
              </div>

              {/* Animated Claimed Progress Bar using Theme Tokens */}
              <div className="relative z-10 mt-4 space-y-1.5">
                <div className="flex justify-between text-[11px] font-medium text-muted">
                  <span>Claimed: {deal.claimedPercent}%</span>
                  <span className="flex items-center gap-1 font-semibold text-warm">
                    <TrendingDown className="w-3 h-3" /> High demand
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted-bg">
                  <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: `${deal.claimedPercent}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, ease: "easeOut", delay: index * 0.15 }}
                    className="h-full rounded-full bg-linear-to-r from-primary via-accent to-warm"
                  />
                </div>
              </div>
            </div>

            {/* Action Footer: Live Card Specific Countdown Timer & Animated Button */}
            <div className="relative z-10 mt-5 sm:mt-6 pt-4 border-t border-border/70 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
              <CardCountdown endTime={deal.endTime} />

              <Link
                href={deal.href}
                className="group/btn inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-surface shadow-xs transition-all duration-200 hover:bg-primary-hover hover:gap-2 active:scale-95 ml-auto sm:ml-0"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Shop Deal</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}