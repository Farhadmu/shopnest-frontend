"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BannerCategory,
  BannerSectionData,
  FALLBACK_CATEGORIES,
  HeroSlide,
  PromoCard as PromoCardType,
} from "@/lib/constants/banner";
import { getCategories } from "@/lib/api/categories";
import { getHeroBanners, HeroBanner } from "@/lib/api/hero-banners";
import { getContrastingTextColor } from "@/lib/utils/banner-color-utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_CYCLE_MS = 7000;
const HERO_ADVANCE_MS = 7000;
const MAX_VISIBLE_CATEGORIES = 10;
const MAX_PROMO_CARDS = 2;

// ---------------------------------------------------------------------------
// PromoCard
// ---------------------------------------------------------------------------

function PromoCard({
  card,
  imageSizes,
  className = "",
}: {
  card: PromoCardType;
  imageSizes: string;
  className?: string;
}) {
  const isLight = card.textTheme !== "dark";
  const customTextColor = isLight ? card.lightTextColor : card.darkTextColor;
  const customButtonColor = (isLight ? card.lightButtonColor : card.darkButtonColor) || card.lightButtonColor || card.darkButtonColor;
  const buttonTextColor = customButtonColor ? getContrastingTextColor(customButtonColor) : undefined;

  return (
    <div
      style={customTextColor ? { color: customTextColor } : undefined}
      className={`relative flex h-full flex-col justify-end overflow-hidden rounded-xl p-4 sm:p-5 ${card.bgClassName ?? "bg-secondary"
        } ${className}`}
    >
      <div className="absolute inset-0">
        <Image
          src={card.image}
          alt={card.title}
          fill
          sizes={imageSizes}
          quality={100}
          className="object-cover"
          priority={false}
        />
        {/* Overlay Scrim */}
        <div
          className="absolute inset-0 transition-opacity"
          style={{
            backgroundColor: card.overlayColor || "#0B0F19",
            opacity: (card.overlayOpacity ?? 70) / 100,
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col justify-end gap-1 max-w-[90%] sm:max-w-[85%]">
        {card.eyebrow && (
          <p
            style={customTextColor ? { color: customTextColor, opacity: 0.85 } : undefined}
            className={`text-[8.5px] font-bold uppercase tracking-widest sm:text-[10px] ${isLight ? "text-white/80" : "text-muted"
              }`}
          >
            {card.eyebrow}
          </p>
        )}
        <h3
          style={customTextColor ? { color: customTextColor } : undefined}
          className={`text-xs font-extrabold leading-snug drop-shadow-sm sm:text-base ${isLight ? "text-white" : "text-text"
            }`}
        >
          {card.title}
          {card.highlight && (
            <>
              {" "}
              <span className="text-warm font-extrabold">
                {card.highlight}
              </span>
            </>
          )}
        </h3>

        {card.subtitle && (
          <p
            style={customTextColor ? { color: customTextColor, opacity: 0.85 } : undefined}
            className={`hidden text-xs opacity-85 sm:block ${isLight ? "text-white/85" : "text-muted"}`}
          >
            {card.subtitle}
          </p>
        )}

        {card.price && (
          <p
            style={customTextColor ? { color: customTextColor } : undefined}
            className={`mt-0.5 text-[10px] sm:text-xs ${isLight ? "text-white/80" : "text-text"
              }`}
          >
            {card.title.toLowerCase().includes("from") ? "" : "FROM "}
            <span
              style={customTextColor ? { color: customTextColor } : undefined}
              className={`text-xs font-bold sm:text-base ${isLight ? "text-success" : "text-primary"
                }`}
            >
              {card.price}
            </span>
          </p>
        )}

        {card.buttonText && card.buttonLink && (
          <Link
            style={
              customButtonColor
                ? {
                    backgroundColor: customButtonColor,
                    color: buttonTextColor,
                  }
                : undefined
            }
            href={card.buttonLink}
            className={`mt-1 inline-flex w-fit items-center rounded-lg px-2.5 py-1 text-[9.5px] font-bold tracking-wide shadow-md transition-transform hover:scale-[1.02] sm:mt-2.5 sm:px-4 sm:py-2 sm:text-[11px] ${customButtonColor
                ? ""
                : isLight
                  ? "bg-white text-slate-900 hover:bg-white/90"
                  : "bg-primary text-white hover:bg-primary-hover"
              }`}
          >
            {card.buttonText}
          </Link>
        )}

        {!card.buttonText && card.buttonLink && (
          <Link
            style={customTextColor ? { color: customTextColor } : undefined}
            href={card.buttonLink}
            className={`mt-1.5 inline-block text-[11px] font-semibold underline sm:text-xs ${isLight ? "text-white" : "text-text"
              }`}
          >
            View
          </Link>
        )}
      </div>
    </div>
  );
}

const PAGE_FLIP_EASE = [0.33, 1, 0.68, 1] as const;

function AnimatedPromoCard({
  card,
  imageSizes,
  className = "",
}: {
  card: PromoCardType;
  imageSizes: string;
  className?: string;
}) {
  return (
    <div
      className={`relative h-full overflow-hidden rounded-xl [perspective:1200px] ${className}`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={card.id || card.image}
          initial={{ rotateY: 35, opacity: 0, scale: 0.96 }}
          animate={{ rotateY: 0, opacity: 1, scale: 1 }}
          exit={{ rotateY: -35, opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.95, ease: PAGE_FLIP_EASE }}
          style={{ transformOrigin: "left center", transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
          className="relative h-full w-full"
        >
          <PromoCard card={card} imageSizes={imageSizes} className="h-full" />

          {/* Soft 3D page turn shadow */}
          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0.5 }}
            transition={{ duration: 0.8 }}
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent rounded-xl"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HeroCarousel
// ---------------------------------------------------------------------------

function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const total = slides.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (total <= 1) return;
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, HERO_ADVANCE_MS);
  }, [total]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  if (total === 0) return null;

  const currentIndex = Math.min(active, total - 1);
  const slide = slides[currentIndex];
  const isLight = slide.textTheme !== "dark";
  const customTextColor = isLight ? slide.lightTextColor : slide.darkTextColor;
  const customButtonColor = (isLight ? slide.lightButtonColor : slide.darkButtonColor) || slide.lightButtonColor || slide.darkButtonColor;
  const buttonTextColor = customButtonColor ? getContrastingTextColor(customButtonColor) : undefined;

  const goTo = (index: number) => {
    setActive((index + total) % total);
    startTimer(); // Reset animation timer on manual click!
  };

  return (
    <div
      onMouseEnter={() => {
        if (timerRef.current) clearInterval(timerRef.current);
      }}
      onMouseLeave={startTimer}
      className={`group relative h-full min-h-56 overflow-hidden rounded-xl sm:min-h-72 lg:min-h-80 [perspective:1400px] ${slide.bgClassName ?? "bg-muted-bg"
        }`}
    >
      {/* 3D Smooth Page Flip Background & Image */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.div
            key={slide.id + "-" + slide.image + "-" + currentIndex}
            initial={{ rotateY: 45, opacity: 0, x: 20, scale: 0.97 }}
            animate={{ rotateY: 0, opacity: 1, x: 0, scale: 1 }}
            exit={{ rotateY: -45, opacity: 0, x: -20, scale: 0.97 }}
            transition={{ duration: 1.15, ease: PAGE_FLIP_EASE }}
            style={{ transformOrigin: "left center", transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
            className="absolute inset-0 shadow-2xl"
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              quality={100}
              className="object-cover"
              priority
            />
            <div
              className="absolute inset-0 transition-opacity"
              style={{
                backgroundColor: slide.overlayColor || "#0B0F19",
                opacity: (slide.overlayOpacity ?? 70) / 100,
              }}
            />

            {/* Page Spine & Book Fold Shadow during smooth turning */}
            <motion.div
              initial={{ opacity: 0.55 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0.65 }}
              transition={{ duration: 1.0 }}
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide text content turning into view with the page */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`content-${slide.id}-${currentIndex}`}
          initial={{ opacity: 0, x: 25, filter: "blur(3px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: -15, filter: "blur(3px)" }}
          transition={{ duration: 0.75, ease: PAGE_FLIP_EASE }}
          className="relative z-10 flex h-full flex-col justify-center gap-1 max-w-[90%] p-4 sm:max-w-[85%] sm:gap-2 sm:p-6 lg:max-w-[75%] xl:max-w-[70%] lg:p-8"
          style={customTextColor ? { color: customTextColor, transformOrigin: "left center" } : { transformOrigin: "left center" }}
        >
          {slide.eyebrow && (
            <span
              style={customTextColor ? { color: customTextColor, opacity: 0.85 } : undefined}
              className={`text-[9px] font-bold uppercase tracking-widest sm:text-xs ${isLight ? "text-white/80" : "text-muted"}`}
            >
              {slide.eyebrow}
            </span>
          )}

          <h2
            style={customTextColor ? { color: customTextColor } : undefined}
            className={`text-base font-extrabold leading-snug drop-shadow-sm sm:text-2xl lg:text-3xl ${isLight ? "text-white" : "text-text"
              }`}
          >
            {slide.title}
            {slide.highlight && (
              <>
                {" "}
                <span className="text-warm font-extrabold">
                  {slide.highlight}
                </span>
              </>
            )}
          </h2>

          {slide.subtitle && (
            <p
              style={customTextColor ? { color: customTextColor, opacity: 0.85 } : undefined}
              className={`hidden text-xs opacity-85 sm:block sm:text-sm ${isLight ? "text-white/85" : "text-muted"}`}
            >
              {slide.subtitle}
            </p>
          )}

          {slide.description && (
            <p
              style={customTextColor ? { color: customTextColor, opacity: 0.8 } : undefined}
              className={`hidden line-clamp-2 mt-0.5 text-xs leading-relaxed sm:block sm:text-sm ${isLight ? "text-white/80" : "text-muted"
                }`}
            >
              {slide.description}
            </p>
          )}

          <Link
            style={
              customButtonColor
                ? {
                    backgroundColor: customButtonColor,
                    color: buttonTextColor,
                  }
                : undefined
            }
            href={slide.buttonLink}
            className={`mt-1.5 inline-flex w-fit items-center rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wide shadow-md transition-transform hover:scale-[1.02] sm:mt-3 sm:px-6 sm:py-2.5 sm:text-sm ${customButtonColor
                ? ""
                : isLight
                  ? "bg-white text-slate-900 hover:bg-white/90"
                  : "bg-primary text-white hover:bg-primary-hover"
              }`}
          >
            {slide.buttonText}
          </Link>
        </motion.div>
      </AnimatePresence>

      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo(currentIndex - 1)}
            className="absolute left-2 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-surface/70 text-text opacity-100 transition-opacity hover:bg-surface sm:left-3 sm:h-8 sm:w-8 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo(currentIndex + 1)}
            className="absolute right-2 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-surface/70 text-text opacity-100 transition-opacity hover:bg-surface sm:right-3 sm:h-8 sm:w-8 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-3 right-3 z-20 rounded-md bg-surface px-2.5 py-1 text-[11px] font-semibold text-text shadow sm:bottom-4 sm:right-4 sm:px-3 sm:text-xs">
            {currentIndex + 1} / {total}
          </div>
        </>
      )}
    </div>
  );
}

function customBannerSlides(banners: HeroBanner[], categoryLabel: string): HeroSlide[] {
  return banners.map((banner) => ({
    id: banner.id,
    eyebrow: banner.eyebrow || undefined,
    title: banner.title || categoryLabel,
    highlight: banner.highlight || undefined,
    subtitle: banner.subtitle || undefined,
    description: banner.description || undefined,
    price: banner.price || undefined,
    image: banner.imageUrl,
    buttonText: banner.buttonText || (banner.targetUrl ? "SHOP NOW" : "EXPLORE"),
    buttonLink: banner.targetUrl || `/products?category=${encodeURIComponent(categoryLabel)}`,
    bgClassName: banner.bgClassName || undefined,
    overlayColor: banner.overlayColor ?? null,
    overlayOpacity: banner.overlayOpacity ?? 70,
    lightTextColor: banner.lightTextColor ?? null,
    darkTextColor: banner.darkTextColor ?? null,
    lightButtonColor: banner.lightButtonColor ?? null,
    darkButtonColor: banner.darkButtonColor ?? null,
    textTheme: banner.textTheme,
  }));
}

function customPromoCards(banners: HeroBanner[], categoryLabel: string): PromoCardType[] {
  return banners.map((banner) => ({
    id: banner.id,
    eyebrow: banner.eyebrow || undefined,
    title: banner.title || categoryLabel,
    highlight: banner.highlight || undefined,
    subtitle: banner.subtitle || undefined,
    description: banner.description || undefined,
    price: banner.price || undefined,
    image: banner.imageUrl,
    buttonText: banner.buttonText || (banner.targetUrl ? "SHOP NOW" : undefined),
    buttonLink: banner.targetUrl || undefined,
    bgClassName: banner.bgClassName || undefined,
    overlayColor: banner.overlayColor ?? null,
    overlayOpacity: banner.overlayOpacity ?? 70,
    lightTextColor: banner.lightTextColor ?? null,
    darkTextColor: banner.darkTextColor ?? null,
    lightButtonColor: banner.lightButtonColor ?? null,
    darkButtonColor: banner.darkButtonColor ?? null,
    textTheme: banner.textTheme,
  }));
}

// ---------------------------------------------------------------------------
// CategorySidebar
// ---------------------------------------------------------------------------

function getCategoryDisplayLabel(label: string): string {
  if (!label) return "";
  const trimmed = label.trim();
  if (trimmed.length > 13) {
    if (trimmed.includes("&")) {
      return trimmed.split("&")[0].trim();
    }
    if (trimmed.includes("/")) {
      return trimmed.split("/")[0].trim();
    }
    const firstWord = trimmed.split(/\s+/)[0];
    return firstWord || trimmed;
  }
  return trimmed;
}

function CategorySidebar({
  categories,
  activeIdx,
  loading,
  onSelect,
}: {
  categories: BannerCategory[];
  activeIdx: number;
  loading: boolean;
  onSelect: (idx: number) => void;
}) {
  const total = categories.length;

  // Sliding loop window of 10 items if total > 10
  const visibleCategories = (() => {
    if (total <= MAX_VISIBLE_CATEGORIES) {
      return categories.map((cat, idx) => ({ cat, originalIdx: idx }));
    }
    const items = [];
    for (let i = 0; i < MAX_VISIBLE_CATEGORIES; i++) {
      const idx = (activeIdx + i) % total;
      items.push({ cat: categories[idx], originalIdx: idx });
    }
    return items;
  })();

  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (!listRef.current) return;
    if (total <= MAX_VISIBLE_CATEGORIES) {
      const li = listRef.current.children[activeIdx] as HTMLElement | undefined;
      li?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeIdx, total]);

  return (
    <aside className="h-full rounded-xl border border-border bg-surface p-1.5 sm:p-2">
      {loading ? (
        <ul className="space-y-2">
          {[...Array(MAX_VISIBLE_CATEGORIES)].map((_, n) => (
            <li key={n} className="h-4 w-24 animate-pulse rounded bg-muted-bg" />
          ))}
        </ul>
      ) : categories.length === 0 ? (
        <p className="text-sm text-muted">No categories found.</p>
      ) : (
        <ul
          ref={listRef}
          className="flex gap-2 overflow-x-auto pb-1 lg:flex lg:h-full lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleCategories.map(({ cat, originalIdx }) => {
              const isActive = originalIdx === activeIdx;
              const displayLabel = getCategoryDisplayLabel(cat.label);
              return (
                <motion.li
                  key={cat.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="shrink-0 lg:flex-1 lg:flex lg:flex-col"
                >
                  <button
                    type="button"
                    title={cat.label}
                    onClick={() => onSelect(originalIdx)}
                    className={`group relative flex h-full w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-all sm:text-[12.5px] ${
                      isActive
                        ? "bg-primary font-semibold text-surface shadow-sm"
                        : "font-medium text-text hover:bg-muted-bg hover:text-primary"
                    }`}
                  >
                    <span className="truncate pr-1">{displayLabel}</span>
                    <ChevronRight
                      className={`h-3 w-3 shrink-0 transition-all ${
                        isActive
                          ? "text-surface opacity-90 translate-x-0.5"
                          : "text-muted/60 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:text-primary"
                      }`}
                    />

                    {isActive && (
                      <motion.span
                        key={`progress-${originalIdx}`}
                        className="absolute bottom-0 left-0 h-0.75 rounded-b-lg bg-surface/40"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: CATEGORY_CYCLE_MS / 1000, ease: "linear" }}
                      />
                    )}
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </aside>
  );
}

// ---------------------------------------------------------------------------
// BannerSkeleton Component (Ultra-modern Shimmer Loading State)
// ---------------------------------------------------------------------------

export function BannerSkeleton() {
  return (
    <section
      aria-label="Loading banners"
      className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[165px_1fr_260px] xl:grid-cols-[175px_1fr_280px]"
    >
      {/* ── Left: Category Sidebar Skeleton ── */}
      <div className="col-span-1 sm:col-span-2 lg:col-span-1">
        <aside className="h-full rounded-xl border border-border/70 bg-surface p-2 shadow-xs flex flex-col justify-between gap-1 min-h-[280px] lg:min-h-[360px]">
          <div className="space-y-1.5 w-full">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg px-2.5 py-2 bg-muted-bg/50 relative overflow-hidden"
              >
                <div
                  className="h-3 rounded-full bg-muted/30 shimmer"
                  style={{ width: `${55 + (i % 4) * 12}%` }}
                />
                <div className="h-2.5 w-2.5 rounded-full bg-muted/20" />
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* ── Centre: Hero + Bottom Cards Skeleton ── */}
      <div className="col-span-1 flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
        {/* Main Hero Banner Skeleton */}
        <div className="relative flex-1 min-h-56 sm:min-h-72 lg:min-h-80 overflow-hidden rounded-xl border border-border/70 bg-gradient-to-br from-surface via-muted-bg/60 to-surface/90 p-5 sm:p-8 flex flex-col justify-center gap-3.5 shadow-xs">
          {/* Ambient Glowing Shimmer Sweep */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent shimmer" />

          {/* Eyebrow Badge Pill */}
          <div className="h-4 w-28 rounded-full bg-primary/20 shimmer" />

          {/* Title Lines */}
          <div className="space-y-2.5 max-w-[85%] sm:max-w-[70%]">
            <div className="h-7 sm:h-10 w-full rounded-lg bg-muted/30 shimmer" />
            <div className="h-5 sm:h-7 w-3/4 rounded-lg bg-muted/25 shimmer" />
          </div>

          {/* Subtitle */}
          <div className="h-3.5 sm:h-4 w-1/2 rounded-md bg-muted/20 shimmer hidden sm:block" />

          {/* Price & Action Button */}
          <div className="mt-2 flex items-center gap-3">
            <div className="h-9 sm:h-10 w-32 sm:w-36 rounded-xl bg-primary/30 shimmer shadow-xs" />
            <div className="h-6 w-20 rounded-md bg-muted/20 shimmer" />
          </div>

          {/* Carousel indicator dots */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
            <div className="h-2 w-6 rounded-full bg-primary/50 shimmer" />
            <div className="h-2 w-2 rounded-full bg-muted/30" />
            <div className="h-2 w-2 rounded-full bg-muted/30" />
          </div>
        </div>

        {/* Bottom Cards Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="relative min-h-28 sm:min-h-36 overflow-hidden rounded-xl border border-border/70 bg-surface p-3.5 sm:p-4 flex flex-col justify-end gap-1.5 shadow-xs"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent shimmer" />
              <div className="h-3 w-16 rounded-full bg-muted/25 shimmer" />
              <div className="h-4 sm:h-5 w-4/5 rounded-md bg-muted/30 shimmer" />
              <div className="h-3 w-1/3 rounded-sm bg-primary/20 shimmer" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Side Cards Skeleton ── */}
      <div className="col-span-1 grid grid-cols-2 gap-4 sm:col-span-2 lg:col-span-1 lg:flex lg:flex-col">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="relative min-h-36 sm:min-h-48 lg:flex-1 overflow-hidden rounded-xl border border-border/70 bg-surface p-4 sm:p-5 flex flex-col justify-end gap-2 shadow-xs"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent shimmer" />
            <div className="h-3 w-20 rounded-full bg-muted/25 shimmer" />
            <div className="h-5 sm:h-6 w-5/6 rounded-lg bg-muted/30 shimmer" />
            <div className="h-3 w-1/2 rounded bg-muted/20 shimmer hidden sm:block" />
            <div className="mt-1 h-7 sm:h-8 w-24 rounded-lg bg-primary/25 shimmer" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// BannerSection
// ---------------------------------------------------------------------------

export default function BannerSection({
  data,
  initialCategories,
}: {
  data?: BannerSectionData;
  /** Pre-fetched categories from HomeDataContext — skips own fetch when provided. */
  initialCategories?: import("@/lib/api/categories").Category[];
}) {
  const heroSlides = data?.heroSlides ?? [];
  const sideCards = data?.sideCards ?? [];
  const bottomCards = data?.bottomCards ?? [];

  // Map all parent categories
  const mapApiCategories = useCallback(
    (cats: import("@/lib/api/categories").Category[]): BannerCategory[] =>
      cats
        .filter((c) => !c.parent) // only top-level (parent) categories
        .map((c, i) => ({
          ...(FALLBACK_CATEGORIES[i % FALLBACK_CATEGORIES.length] ?? FALLBACK_CATEGORIES[0]),
          id: c.id,
          label: c.name,
          href: `/products?category=${encodeURIComponent(c.name)}`,
        })),
    []
  );

  const [fetchedCategories, setFetchedCategories] = useState<BannerCategory[]>([]);
  const [isFetchingCats, setIsFetchingCats] = useState(
    () => !initialCategories || initialCategories.length === 0
  );
  const [isInitialLoading, setIsInitialLoading] = useState(
    () => !initialCategories || initialCategories.length === 0
  );

  const categories = useMemo(() => {
    if (initialCategories && initialCategories.length > 0) {
      return mapApiCategories(initialCategories);
    }
    if (fetchedCategories.length > 0) {
      return fetchedCategories;
    }
    return data?.categories ?? FALLBACK_CATEGORIES;
  }, [initialCategories, fetchedCategories, data?.categories, mapApiCategories]);

  const categoriesLoading =
    (!initialCategories || initialCategories.length === 0) && isFetchingCats;

  const [bannerMap, setBannerMap] = useState<Record<string, HeroBanner[]>>({});
  const [activeIdx, setActiveIdx] = useState(0);
  const isPaused = useRef(false);
  const isVisible = useRef(true);
  const sectionRef = useRef<HTMLElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setIsInitialLoading(false);
      return;
    }

    let cancelled = false;
    getCategories()
      .then((cats) => {
        if (cancelled) return;
        setFetchedCategories(mapApiCategories(cats));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setIsFetchingCats(false);
          setIsInitialLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialCategories, mapApiCategories]);

  // Fetch global hero banners on mount
  useEffect(() => {
    let cancelled = false;
    getHeroBanners()
      .then((globalBanners) => {
        if (cancelled || !globalBanners || globalBanners.length === 0) return;
        setBannerMap((prev) => ({ ...prev, global: globalBanners }));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setIsInitialLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const activeCat = categories[activeIdx];
  const activeCategoryId = activeCat?.id;

  // Fetch banners for active category if not already cached in bannerMap
  useEffect(() => {
    if (!activeCategoryId || !/^[a-f\d]{24}$/i.test(activeCategoryId)) {
      return;
    }
    if (bannerMap[activeCategoryId]) {
      return;
    }

    let cancelled = false;
    getHeroBanners(activeCategoryId)
      .then((categoryBanners) => {
        if (cancelled) return;
        setBannerMap((prev) => ({ ...prev, [activeCategoryId]: categoryBanners }));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [activeCategoryId, bannerMap]);

  // Pre-fetch banners for ALL categories in the background so transitions are instant
  useEffect(() => {
    if (categories.length === 0) return;
    let cancelled = false;

    categories.forEach((cat) => {
      if (cat.id && /^[a-f\d]{24}$/i.test(cat.id)) {
        getHeroBanners(cat.id)
          .then((categoryBanners) => {
            if (cancelled) return;
            setBannerMap((prev) => {
              if (prev[cat.id!]) return prev;
              return { ...prev, [cat.id!]: categoryBanners };
            });
          })
          .catch(() => {});
      }
    });

    return () => {
      cancelled = true;
    };
  }, [categories]);

  // Invalidate banner cache on window focus so admin changes show immediately on homepage
  useEffect(() => {
    const handleFocus = () => {
      const activeId = categories[activeIdx]?.id;
      if (activeId && /^[a-f\d]{24}$/i.test(activeId)) {
        getHeroBanners(activeId)
          .then((categoryBanners) => {
            setBannerMap((prev) => ({ ...prev, [activeId]: categoryBanners }));
          })
          .catch(() => {});
      }
      getHeroBanners()
        .then((globalBanners) => {
          if (globalBanners && globalBanners.length > 0) {
            setBannerMap((prev) => ({ ...prev, global: globalBanners }));
          }
        })
        .catch(() => {});
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [categories, activeIdx]);

  const startCategoryTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (categories.length === 0) return;
    timerRef.current = setInterval(() => {
      if (!isPaused.current && isVisible.current) {
        setActiveIdx((prev) => (prev + 1) % categories.length);
      }
    }, CATEGORY_CYCLE_MS);
  }, [categories.length]);

  useEffect(() => {
    startCategoryTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startCategoryTimer]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSelectCategory = (idx: number) => {
    setActiveIdx(idx);
    startCategoryTimer(); // Reset the category auto-cycle timer on user click!
  };

  const categoryLabel = activeCat?.label ?? "ShopNest";
  const globalBanners = bannerMap["global"] ?? [];
  const currentCatBanners = activeCategoryId ? bannerMap[activeCategoryId] : undefined;
  const categoryBanners =
    currentCatBanners && currentCatBanners.length > 0
      ? currentCatBanners
      : globalBanners;

  const heroBanners = categoryBanners.filter((banner) => banner.placement === "hero");
  const sideBanners = categoryBanners.filter((banner) => banner.placement === "side");
  const bottomBanners = categoryBanners.filter((banner) => banner.placement === "bottom");

  const activeHeroSlides =
    heroBanners.length > 0
      ? customBannerSlides(heroBanners, categoryLabel)
      : heroSlides.length > 0
      ? heroSlides
      : [];

  const activeSideCards = (
    sideBanners.length > 0 ? customPromoCards(sideBanners, categoryLabel) : []
  ).slice(0, MAX_PROMO_CARDS);

  const activeBottomCards = (
    bottomBanners.length > 0 ? customPromoCards(bottomBanners, categoryLabel) : []
  ).slice(0, MAX_PROMO_CARDS);

  const hasSideCards = activeSideCards.length > 0;

  if (categoriesLoading || (isInitialLoading && categories.length === 0)) {
    return <BannerSkeleton />;
  }

  return (
    <section
      ref={sectionRef}
      className={`grid gap-4 ${
        hasSideCards
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-[165px_1fr_260px] xl:grid-cols-[175px_1fr_280px]"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-[165px_1fr] xl:grid-cols-[175px_1fr]"
      }`}
    >
      {/* ── Left: Category sidebar ── */}
      <div className="col-span-1 sm:col-span-2 lg:col-span-1">
        <CategorySidebar
          categories={categories}
          activeIdx={activeIdx}
          loading={categoriesLoading}
          onSelect={handleSelectCategory}
        />
      </div>

      {/* ── Centre: Hero + bottom cards ── */}
      <div className="col-span-1 flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
        <div className="flex-1">
          <HeroCarousel
            key={activeHeroSlides[0]?.id ?? `hero-${activeIdx}`}
            slides={activeHeroSlides}
          />
        </div>

        {activeBottomCards.length > 0 && (
          <div className={`grid gap-4 ${activeBottomCards.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {activeBottomCards.map((card, idx) => (
              <AnimatedPromoCard
                key={`bottom-slot-${idx}`}
                card={card}
                imageSizes={
                  activeBottomCards.length === 1
                    ? "(max-width: 1024px) 100vw, 50vw"
                    : "(max-width: 1024px) 50vw, 25vw"
                }
                className="min-h-28 sm:min-h-36"
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Right: Side cards ── */}
      {hasSideCards && (
        <div className="col-span-1 grid grid-cols-2 gap-4 sm:col-span-2 lg:col-span-1 lg:flex lg:flex-col">
          {activeSideCards.map((card, idx) => (
            <AnimatedPromoCard
              key={`side-slot-${idx}`}
              card={card}
              imageSizes="(max-width: 1024px) 50vw, 25vw"
              className="min-h-36 sm:min-h-48 lg:flex-1"
            />
          ))}
        </div>
      )}
    </section>
  );
}