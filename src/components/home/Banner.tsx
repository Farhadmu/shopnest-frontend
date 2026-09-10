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
const HERO_ADVANCE_MS   = 7000;
const MAX_CATEGORIES    = 10;
const MAX_PROMO_CARDS    = 2;
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

  return (
    <div
      style={customTextColor ? { color: customTextColor } : undefined}
      className={`relative flex h-full flex-col justify-between overflow-hidden rounded-xl p-4 sm:p-5 ${
        card.bgClassName ?? "bg-secondary"
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
          className={`absolute inset-0 ${
            card.overlayColor === undefined
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
            className={`text-[9px] font-semibold tracking-widest sm:text-[10px] ${
              isLight ? "text-surface/70" : "text-muted"
            }`}
          >
            {card.eyebrow}
          </p>
        )}
        <h3
          style={customTextColor ? { color: customTextColor } : undefined}
          className={`mt-1 text-sm font-bold leading-snug sm:text-base ${
            isLight ? "text-surface" : "text-text"
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
            className={`mt-1 text-[11px] sm:text-xs ${
              isLight ? "text-surface/80" : "text-muted"
            }`}
          >
            {card.description}
          </p>
        )}

        {card.price && (
          <p
            style={customTextColor ? { color: customTextColor } : undefined}
            className={`mt-1 text-[11px] sm:text-xs ${
              isLight ? "text-surface/80" : "text-text"
            }`}
          >
            {card.title.toLowerCase().includes("from") ? "" : "FROM "}
            <span
              style={customTextColor ? { color: customTextColor } : undefined}
              className={`text-sm font-bold sm:text-base ${
                isLight ? "text-success" : "text-primary"
              }`}
            >
              {card.price}
            </span>
          </p>
        )}

        {card.buttonText && card.buttonLink && (
          <Link
            style={customTextColor ? { color: customTextColor } : undefined}
            href={card.buttonLink}
            className={`mt-2 inline-block rounded-md px-3 py-1.5 text-[10px] font-bold tracking-wide transition-colors sm:mt-3 sm:px-4 sm:py-2 sm:text-[11px] ${
              isLight
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
            className={`mt-2 inline-block text-[11px] font-semibold underline sm:text-xs ${
              isLight ? "text-surface" : "text-text"
            }`}
          >
            View
          </Link>
        )}
      </div>
    </div>
  );
}

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
    <div className={`relative h-full overflow-hidden rounded-xl ${className}`}>
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={card.id}
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ duration: 0.55, ease: SWIPE_EASE }}
          className="h-full"
        >
          <PromoCard card={card} imageSizes={imageSizes} className="h-full" />
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
  const goTo = (index: number) => setActive((index + total) % total);

  return (
    <div
      className={`group relative h-full min-h-56 overflow-hidden rounded-xl sm:min-h-72 lg:min-h-80 ${
        slide.bgClassName ?? "bg-muted-bg"
      }`}
    >
      <div className="absolute inset-0">
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
          className={`absolute inset-0 ${
            slide.overlayColor === undefined
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
      </div>

      <div
        className="relative z-10 flex h-full flex-col justify-center gap-2 max-w-[85%] p-5 sm:max-w-[70%] sm:gap-3 sm:p-6 lg:max-w-[55%] lg:p-8"
        style={customTextColor ? { color: customTextColor } : undefined}
      >
        <h2
          style={customTextColor ? { color: customTextColor } : undefined}
          className={`text-xl font-extrabold leading-tight sm:text-2xl lg:text-3xl ${
            isLight ? "text-surface" : "text-text"
          }`}
        >
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p
            style={customTextColor ? { color: customTextColor } : undefined}
            className={`text-lg font-extrabold leading-tight sm:text-xl lg:text-2xl ${
              isLight ? "text-surface" : "text-text"
            }`}
          >
            {slide.subtitle}
          </p>
        )}
        {slide.description && (
          <p
            style={customTextColor ? { color: customTextColor } : undefined}
            className={`mt-1 text-xs leading-relaxed sm:text-sm ${
              isLight ? "text-surface/80" : "text-muted"
            }`}
          >
            {slide.description}
          </p>
        )}

        <Link
          style={customTextColor ? { color: customTextColor } : undefined}
          href={slide.buttonLink}
          className={`mt-3 inline-block w-fit rounded-md px-4 py-2 text-xs font-bold tracking-wide transition-colors sm:mt-4 sm:px-6 sm:py-3 sm:text-sm ${
            isLight
              ? "bg-surface text-text hover:bg-muted-bg"
              : "bg-primary text-surface hover:bg-primary-hover"
          }`}
        >
          {slide.buttonText}
        </Link>
      </div>

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
    textTheme: banner.textTheme,
  }));
}

// ---------------------------------------------------------------------------
// CategorySidebar
// ---------------------------------------------------------------------------

function CategorySidebar({
  categories,
  activeIdx,
  loading,
  saleLabel,
  onSelect,
}: {
  categories: BannerCategory[];
  activeIdx: number;
  loading: boolean;
  saleLabel?: string;
  onSelect: (idx: number) => void;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (!listRef.current) return;
    const li = listRef.current.children[activeIdx] as HTMLElement | undefined;
    li?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeIdx]);

  return (
    <aside className="col-span-2 rounded-xl border border-border bg-surface p-4 sm:col-span-4 sm:p-5 lg:col-span-2">
      {saleLabel && (
        <p className="mb-3 text-sm font-bold text-error">{saleLabel}</p>
      )}

      {loading ? (
        <ul className="space-y-3">
          {[...Array(MAX_CATEGORIES)].map((_, n) => (
            <li key={n} className="h-4 w-24 animate-pulse rounded bg-muted-bg" />
          ))}
        </ul>
      ) : categories.length === 0 ? (
        <p className="text-sm text-muted">No categories found.</p>
      ) : (
        <ul
          ref={listRef}
          className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0"
        >
          {categories.map((cat, idx) => {
            const isActive = idx === activeIdx;
            return (
              <li key={cat.id} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  title={cat.label}
                  onClick={() => onSelect(idx)}
                  className={`relative w-full rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
                    isActive
                      ? "bg-primary text-surface"
                      : "text-text hover:bg-muted-bg hover:text-primary"
                  }`}
                >
                  <span className="block truncate pr-1">{cat.label}</span>

                  {isActive && (
                    <motion.span
                      key={`progress-${idx}`}
                      className="absolute bottom-0 left-0 h-0.75 rounded-b-lg bg-surface/40"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: CATEGORY_CYCLE_MS / 1000, ease: "linear" }}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

// ---------------------------------------------------------------------------
// BannerSection
// ---------------------------------------------------------------------------

export default function BannerSection({ data }: { data: BannerSectionData }) {
  const { saleLabel, heroSlides, sideCards, bottomCards } = data;

  const [categories, setCategories] = useState<BannerCategory[]>(() =>
    (data.categories ?? FALLBACK_CATEGORIES).slice(0, MAX_CATEGORIES)
  );
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [customBanners, setCustomBanners] = useState<HeroBanner[]>([]);
  const [bannerCategoryId, setBannerCategoryId] = useState<string | null>(null);
  const [bannersLoading, setBannersLoading] = useState(false);
  const bannerCache = useRef(new Map<string, HeroBanner[]>());

  const [activeIdx, setActiveIdx] = useState(0);
  const isPaused = useRef(false);
  const isVisible = useRef(true);
  const sectionRef = useRef<HTMLElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((cats) => {
        if (cancelled) return;
        const slicedCats = cats.slice(0, MAX_CATEGORIES);
        setCategories(
          slicedCats.map((c, i) => ({
            ...(FALLBACK_CATEGORIES[i % FALLBACK_CATEGORIES.length] ?? FALLBACK_CATEGORIES[0]),
            id: c.id,
            label: c.name,
            href: `/products?category=${encodeURIComponent(c.name)}`,
          }))
        );
      })
      .catch(() => {
        if (!cancelled) {
          setCategories((data.categories ?? FALLBACK_CATEGORIES).slice(0, MAX_CATEGORIES));
        }
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const isApiCategory = Boolean(activeCat?.id && /^[a-f\d]{24}$/i.test(activeCat.id));
  const categoryBanners = bannerCategoryId === activeCat?.id ? customBanners : [];
  const heroBanners = categoryBanners.filter((banner) => banner.placement === "hero");
  const sideBanners = categoryBanners.filter((banner) => banner.placement === "side");
  const bottomBanners = categoryBanners.filter((banner) => banner.placement === "bottom");
  const dynamicHeroSlides = heroBanners.length > 0
    ? customBannerSlides(heroBanners, categoryLabel)
    : activeCat?.heroSlides ?? heroSlides;
  const activeHeroSlides = isApiCategory 
    ? (bannersLoading || heroBanners.length === 0 ? [] : customBannerSlides(heroBanners, categoryLabel))
    : dynamicHeroSlides;
  const activeSideCards = sideBanners.length > 0
    ? customPromoCards(sideBanners, categoryLabel).slice(0, MAX_PROMO_CARDS)
    : isApiCategory
      ? []
      : activeCat?.sideCards ?? sideCards;
  const activeBottomCards = bottomBanners.length > 0
    ? customPromoCards(bottomBanners, categoryLabel).slice(0, MAX_PROMO_CARDS)
    : isApiCategory
      ? []
      : activeCat?.bottomCards ?? bottomCards;

  return (
    <section
      ref={sectionRef}
      className="grid grid-cols-2 gap-4 pb-8 sm:grid-cols-4 lg:grid-cols-12"
      onMouseEnter={() => { isPaused.current = true; }}
      onMouseLeave={() => { isPaused.current = false; }}
    >
      {/* ── Left: Category sidebar ── */}
      <CategorySidebar
        categories={categories}
        activeIdx={activeIdx}
        loading={categoriesLoading}
        saleLabel={saleLabel}
        onSelect={handleSelectCategory}
      />

      {/* ── Centre: Hero + bottom cards ── */}
      <div className="col-span-2 flex flex-col gap-4 sm:col-span-4 lg:col-span-7">
        <div className="flex-1">
          <HeroCarousel slides={activeHeroSlides} />
        </div>

        {activeBottomCards.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {activeBottomCards.map((card) => (
              <AnimatedPromoCard
                key={card.id}
                card={card}
                imageSizes="(max-width: 1024px) 50vw, 25vw"
                className="min-h-28 sm:min-h-36"
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Right: Side cards ── */}
      {activeSideCards.length > 0 && (
        <div className="col-span-2 grid grid-cols-2 gap-4 sm:col-span-4 lg:col-span-3 lg:flex lg:flex-col">
            {activeSideCards.map((card) => (
              <AnimatedPromoCard
                key={card.id}
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