"use client";

import { useEffect, useRef, useState } from "react";
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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_CYCLE_MS = 7000;
const HERO_ADVANCE_MS = 7000;
const MAX_VISIBLE_CATEGORIES = 10;
const MAX_PROMO_CARDS = 2;
const SWIPE_EASE = [0.22, 1, 0.36, 1] as const;

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
  const isLight = card.textTheme === "light";
  const customTextColor = isLight ? card.lightTextColor : card.darkTextColor;
  const customButtonColor = isLight ? card.lightButtonColor : card.darkButtonColor;

  return (
    <div
      style={customTextColor ? { color: customTextColor } : undefined}
      className={`relative flex h-full flex-col justify-between overflow-hidden rounded-xl p-4 sm:p-5 ${card.bgClassName ?? "bg-secondary"
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
        <div
          className={`absolute inset-0 ${card.overlayColor === undefined
              ? isLight
                ? "bg-secondary/50"
                : "bg-surface/70"
              : ""
            }`}
          style={
            card.overlayColor
              ? {
                backgroundColor: card.overlayColor,
                opacity: (card.overlayOpacity ?? 50) / 100,
              }
              : undefined
          }
        />
      </div>

      <div className="relative z-10 max-w-[85%] sm:max-w-[75%]">
        {card.eyebrow && (
          <p
            style={customTextColor ? { color: customTextColor } : undefined}
            className={`text-[9px] font-semibold tracking-widest sm:text-[10px] ${isLight ? "text-surface/70" : "text-muted"
              }`}
          >
            {card.eyebrow}
          </p>
        )}
        <h3
          style={customTextColor ? { color: customTextColor } : undefined}
          className={`mt-1 text-sm font-bold leading-snug sm:text-base ${isLight ? "text-surface" : "text-text"
            }`}
        >
          {card.title}
          {card.highlight && (
            <>
              {" "}
              <span
                className={isLight ? "text-warm" : "text-primary"}
                style={customTextColor ? { color: customTextColor } : undefined}
              >
                {card.highlight}
              </span>
            </>
          )}
        </h3>

        {card.description && (
          <p
            style={customTextColor ? { color: customTextColor } : undefined}
            className={`mt-1 text-[11px] sm:text-xs ${isLight ? "text-surface/80" : "text-muted"
              }`}
          >
            {card.description}
          </p>
        )}

        {card.price && (
          <p
            style={customTextColor ? { color: customTextColor } : undefined}
            className={`mt-1 text-[11px] sm:text-xs ${isLight ? "text-surface/80" : "text-text"
              }`}
          >
            {card.title.toLowerCase().includes("from") ? "" : "FROM "}
            <span
              style={customTextColor ? { color: customTextColor } : undefined}
              className={`text-sm font-bold sm:text-base ${isLight ? "text-success" : "text-primary"
                }`}
            >
              {card.price}
            </span>
          </p>
        )}

        {card.buttonText && card.buttonLink && (
          <Link
            style={customButtonColor ? { backgroundColor: customButtonColor } : undefined}
            href={card.buttonLink}
            className={`mt-2 inline-block rounded-md px-3 py-1.5 text-[10px] font-bold tracking-wide transition-colors sm:mt-3 sm:px-4 sm:py-2 sm:text-[11px] ${customButtonColor
                ? "text-white"
                : isLight
                  ? "bg-surface text-text hover:bg-muted-bg"
                  : "bg-primary text-surface hover:bg-primary-hover"
              }`}
          >
            {card.buttonText}
          </Link>
        )}

        {!card.buttonText && card.buttonLink && (
          <Link
            style={customTextColor ? { color: customTextColor } : undefined}
            href={card.buttonLink}
            className={`mt-2 inline-block text-[11px] font-semibold underline sm:text-xs ${isLight ? "text-surface" : "text-text"
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

  useEffect(() => {
    setActive(0);
  }, [slides]);

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, HERO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [total]);

  if (total === 0) return null;

  const currentIndex = Math.min(active, total - 1);
  const slide = slides[currentIndex];
  const isLight = slide.textTheme !== "dark";
  const customTextColor = isLight ? slide.lightTextColor : slide.darkTextColor;
  const customButtonColor = isLight ? slide.lightButtonColor : slide.darkButtonColor;
  const goTo = (index: number) => setActive((index + total) % total);

  return (
    <div
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
              className={`absolute inset-0 ${slide.overlayColor === undefined
                  ? isLight
                    ? "bg-secondary/50"
                    : "bg-surface/70"
                  : ""
                }`}
              style={
                slide.overlayColor
                  ? {
                    backgroundColor: slide.overlayColor,
                    opacity: (slide.overlayOpacity ?? 50) / 100,
                  }
                  : undefined
              }
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
          className="relative z-10 flex h-full flex-col justify-center gap-2 max-w-[85%] p-5 sm:max-w-[70%] sm:gap-3 sm:p-6 lg:max-w-[55%] lg:p-8"
          style={customTextColor ? { color: customTextColor, transformOrigin: "left center" } : { transformOrigin: "left center" }}
        >
          <h2
            style={customTextColor ? { color: customTextColor } : undefined}
            className={`text-xl font-extrabold leading-tight sm:text-2xl lg:text-3xl ${isLight ? "text-surface" : "text-text"
              }`}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p
              style={customTextColor ? { color: customTextColor } : undefined}
              className={`text-lg font-extrabold leading-tight sm:text-xl lg:text-2xl ${isLight ? "text-surface" : "text-text"
                }`}
            >
              {slide.subtitle}
            </p>
          )}
          {slide.description && (
            <p
              style={customTextColor ? { color: customTextColor } : undefined}
              className={`mt-1 text-xs leading-relaxed sm:text-sm ${isLight ? "text-surface/80" : "text-muted"
                }`}
            >
              {slide.description}
            </p>
          )}

          <Link
            style={customButtonColor ? { backgroundColor: customButtonColor } : undefined}
            href={slide.buttonLink}
            className={`mt-3 inline-block w-fit rounded-md px-4 py-2 text-xs font-bold tracking-wide transition-colors sm:mt-4 sm:px-6 sm:py-3 sm:text-sm ${customButtonColor
                ? "text-white"
                : isLight
                  ? "bg-surface text-text hover:bg-muted-bg"
                  : "bg-primary text-surface hover:bg-primary-hover"
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
    overlayOpacity: banner.overlayColor ? banner.overlayOpacity ?? 50 : null,
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
    description: banner.description || banner.subtitle || undefined,
    price: banner.price || undefined,
    image: banner.imageUrl,
    buttonText: banner.buttonText || (banner.targetUrl ? "SHOP NOW" : undefined),
    buttonLink: banner.targetUrl || undefined,
    bgClassName: banner.bgClassName || undefined,
    overlayColor: banner.overlayColor ?? null,
    overlayOpacity: banner.overlayColor ? banner.overlayOpacity ?? 50 : null,
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
// BannerSection
// ---------------------------------------------------------------------------

export default function BannerSection({
  data,
  initialCategories,
}: {
  data: BannerSectionData;
  /** Pre-fetched categories from HomeDataContext — skips own fetch when provided. */
  initialCategories?: import("@/lib/api/categories").Category[];
}) {
  const { heroSlides, sideCards, bottomCards } = data;

  // Map all parent categories (without slicing to 10), so full list cycles in sidebar
  const mapApiCategories = (cats: import("@/lib/api/categories").Category[]): BannerCategory[] =>
    cats
      .filter((c) => !c.parent) // only top-level (parent) categories
      .map((c, i) => ({
        ...(FALLBACK_CATEGORIES[i % FALLBACK_CATEGORIES.length] ?? FALLBACK_CATEGORIES[0]),
        id: c.id,
        label: c.name,
        href: `/products?category=${encodeURIComponent(c.name)}`,
      }));

  const [categories, setCategories] = useState<BannerCategory[]>(() => {
    if (initialCategories && initialCategories.length > 0) {
      return mapApiCategories(initialCategories);
    }
    return data.categories ?? FALLBACK_CATEGORIES;
  });
  const [categoriesLoading, setCategoriesLoading] = useState(
    () => !initialCategories || initialCategories.length === 0
  );
  const [customBanners, setCustomBanners] = useState<HeroBanner[]>([]);
  const [bannerCategoryId, setBannerCategoryId] = useState<string | null>(null);
  const [, setBannersLoading] = useState(false);
  const bannerCache = useRef(new Map<string, HeroBanner[]>());

  const [activeIdx, setActiveIdx] = useState(0);
  const isPaused = useRef(false);
  const isVisible = useRef(true);
  const sectionRef = useRef<HTMLElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // If pre-fetched categories are available, apply them and skip fetch.
    if (initialCategories && initialCategories.length > 0) {
      setCategories(mapApiCategories(initialCategories));
      setCategoriesLoading(false);
      return;
    }

    // Fallback: self-fetch when no initialCategories provided.
    let cancelled = false;
    getCategories()
      .then((cats) => {
        if (cancelled) return;
        setCategories(mapApiCategories(cats));
      })
      .catch(() => {
        if (!cancelled) {
          setCategories(data.categories ?? FALLBACK_CATEGORIES);
        }
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCategories]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (categories.length === 0) return;
    timerRef.current = setInterval(() => {
      if (!isPaused.current && isVisible.current) {
        setActiveIdx((prev) => (prev + 1) % categories.length);
      }
    }, CATEGORY_CYCLE_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [categories.length]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { isVisible.current = entry.isIntersecting; },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSelectCategory = (idx: number) => {
    setActiveIdx(idx);
  };

  const activeCat = categories[activeIdx];
  useEffect(() => {
    const activeCategoryId = activeCat?.id;
    if (!activeCategoryId || !/^[a-f\d]{24}$/i.test(activeCategoryId)) {
      return;
    }

    const cached = bannerCache.current.get(activeCategoryId);
    if (cached) {
      setBannerCategoryId(activeCategoryId);
      setCustomBanners(cached);
      setBannersLoading(false);
      return;
    }

    let cancelled = false;
    setBannersLoading(true);
    getHeroBanners(activeCategoryId)
      .then((categoryBanners) => {
        if (cancelled) return;
        bannerCache.current.set(activeCategoryId, categoryBanners);
        setBannerCategoryId(activeCategoryId);
        setCustomBanners(categoryBanners);
      })
      .catch(() => {
        if (!cancelled) setBannersLoading(false);
      })
      .finally(() => {
        if (!cancelled) setBannersLoading(false);
      });
    return () => { cancelled = true; };
  }, [activeCat?.id]);

  const categoryLabel = activeCat?.label ?? "ShopNest";
  const categoryBanners = bannerCategoryId === activeCat?.id ? customBanners : [];
  const heroBanners = categoryBanners.filter((banner) => banner.placement === "hero");
  const sideBanners = categoryBanners.filter((banner) => banner.placement === "side");
  const bottomBanners = categoryBanners.filter((banner) => banner.placement === "bottom");

  const activeHeroSlides = heroBanners.length > 0
    ? customBannerSlides(heroBanners, categoryLabel)
    : activeCat?.heroSlides ?? heroSlides;

  const activeSideCards = (sideBanners.length > 0
    ? customPromoCards(sideBanners, categoryLabel)
    : activeCat?.sideCards ?? sideCards
  ).slice(0, MAX_PROMO_CARDS);

  const activeBottomCards = (bottomBanners.length > 0
    ? customPromoCards(bottomBanners, categoryLabel)
    : activeCat?.bottomCards ?? bottomCards
  ).slice(0, MAX_PROMO_CARDS);

  const hasSideCards = activeSideCards.length > 0;

  return (
    <section
      ref={sectionRef}
      className={`grid gap-4 pb-8 ${hasSideCards
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
          <HeroCarousel slides={activeHeroSlides} />
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