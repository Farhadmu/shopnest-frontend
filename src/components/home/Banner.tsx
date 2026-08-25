"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BannerCategory, BannerSectionData, HeroSlide, PromoCard as PromoCardType } from "@/lib/banner/BannerData";
import { getCategories } from "@/lib/api/categories";

const AUTO_ADVANCE_MS = 6000;

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

  return (
    <div
      className={`relative flex h-full flex-col justify-between overflow-hidden rounded-xl p-4 sm:p-5 ${
        card.bgClassName ?? "bg-secondary"
      } ${className}`}
    >
      {/* Background image, full width/height */}
      <div className="absolute inset-0">
        <Image
          src={card.image}
          alt={card.title}
          fill
          sizes={imageSizes}
          className="object-cover"
          priority={false}
        />
        {/* Overlay so text stays readable over any image */}
        <div className={`absolute inset-0 ${isLight ? "bg-secondary/50" : "bg-surface/70"}`} />
      </div>

      <div className="relative z-10 max-w-[85%] sm:max-w-[75%]">
        {card.eyebrow && (
          <p
            className={`text-[9px] sm:text-[10px] font-semibold tracking-widest ${
              isLight ? "text-surface/70" : "text-muted"
            }`}
          >
            {card.eyebrow}
          </p>
        )}
        <h3
          className={`mt-1 text-sm sm:text-base font-bold leading-snug ${
            isLight ? "text-surface" : "text-text"
          }`}
        >
          {card.title}
          {card.highlight && (
            <>
              {" "}
              <span className={isLight ? "text-warm" : "text-primary"}>{card.highlight}</span>
            </>
          )}
        </h3>

        {card.description && (
          <p
            className={`mt-1 text-[11px] sm:text-xs ${isLight ? "text-surface/80" : "text-muted"}`}
          >
            {card.description}
          </p>
        )}

        {card.price && (
          <p className={`mt-1 text-[11px] sm:text-xs ${isLight ? "text-surface/80" : "text-text"}`}>
            {card.title.toLowerCase().includes("from") ? "" : "FROM "}
            <span
              className={`text-sm sm:text-base font-bold ${isLight ? "text-success" : "text-primary"}`}
            >
              {card.price}
            </span>
          </p>
        )}

        {card.buttonText && card.buttonLink && (
          <Link
            href={card.buttonLink}
            className={`mt-2 sm:mt-3 inline-block rounded-md px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-[11px] font-bold tracking-wide transition-colors ${
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
            href={card.buttonLink}
            className={`mt-2 inline-block text-[11px] sm:text-xs font-semibold underline ${
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

function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const total = slides.length;

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [total]);

  if (total === 0) return null;

  const slide = slides[active];
  const isLight = slide.textTheme !== "dark";

  const goTo = (index: number) => setActive((index + total) % total);

  return (
    <div
      className={`group relative h-full min-h-[220px] sm:min-h-[280px] lg:min-h-[320px] overflow-hidden rounded-xl ${
        slide.bgClassName ?? "bg-muted-bg"
      }`}
    >
      {/* Background image, full width/height */}
      <div className="absolute inset-0">
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
          priority
        />
        {/* Overlay so text stays readable over any image */}
        <div className={`absolute inset-0 ${isLight ? "bg-secondary/50" : "bg-surface/70"}`} />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-center gap-2 sm:gap-3 p-5 sm:p-6 lg:p-8 max-w-[85%] sm:max-w-[70%] lg:max-w-[55%]">
        <h2
          className={`text-xl sm:text-2xl lg:text-3xl font-extrabold leading-tight ${
            isLight ? "text-surface" : "text-text"
          }`}
        >
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p
            className={`text-lg sm:text-xl lg:text-2xl font-extrabold leading-tight ${
              isLight ? "text-surface" : "text-text"
            }`}
          >
            {slide.subtitle}
          </p>
        )}
        {slide.description && (
          <p
            className={`mt-1 text-xs sm:text-sm leading-relaxed ${isLight ? "text-surface/80" : "text-muted"}`}
          >
            {slide.description}
          </p>
        )}

        <Link
          href={slide.buttonLink}
          className={`mt-3 sm:mt-4 inline-block w-fit rounded-md px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-bold tracking-wide transition-colors ${
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
            onClick={() => goTo(active - 1)}
            className="absolute left-2 sm:left-3 top-1/2 z-20 flex h-7 w-7 sm:h-8 sm:w-8 -translate-y-1/2 items-center justify-center rounded-full bg-surface/70 text-text opacity-100 transition-opacity hover:bg-surface sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo(active + 1)}
            className="absolute right-2 sm:right-3 top-1/2 z-20 flex h-7 w-7 sm:h-8 sm:w-8 -translate-y-1/2 items-center justify-center rounded-full bg-surface/70 text-text opacity-100 transition-opacity hover:bg-surface sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 rounded-md bg-surface px-2.5 py-1 sm:px-3 text-[11px] sm:text-xs font-semibold text-text shadow">
            {active + 1} / {total}
          </div>
        </>
      )}
    </div>
  );
}

export default function BannerSection({ data }: { data: BannerSectionData }) {
  const { saleLabel, heroSlides, sideCards, bottomCards } = data;

  const [categories, setCategories] = useState<BannerCategory[]>(data.categories ?? []);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((cats) => {
        if (cancelled) return;
        setCategories(
          cats.map((c) => ({
            id: c.id,
            label: c.name,
            href: `/products?category=${encodeURIComponent(c.name)}`,
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setCategories(data.categories ?? []);
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 pb-6 sm:grid-cols-4 lg:grid-cols-12 lg:px-8">
      {/* Categories sidebar */}
      <aside className="col-span-2 rounded-xl border border-border bg-surface p-4 sm:col-span-4 sm:p-5 lg:col-span-2">
        {saleLabel && <p className="mb-3 text-sm font-bold text-error">{saleLabel}</p>}
        {categoriesLoading ? (
          <ul className="space-y-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <li key={n} className="h-4 w-24 animate-pulse rounded bg-muted-bg" />
            ))}
          </ul>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted">No categories found.</p>
        ) : (
          <ul className="flex gap-4 overflow-x-auto pb-1 lg:block lg:space-y-3 lg:overflow-visible lg:pb-0">
            {categories.map((cat) => (
              <li key={cat.id} className="shrink-0 lg:shrink">
                <Link
                  href={cat.href}
                  className="whitespace-nowrap text-sm font-medium text-text hover:text-primary"
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Hero + bottom cards */}
      <div className="col-span-2 flex flex-col gap-4 sm:col-span-4 lg:col-span-7">
        <div className="flex-1">
          <HeroCarousel slides={heroSlides} />
        </div>

        {bottomCards.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {bottomCards.map((card) => (
              <PromoCard
                key={card.id}
                card={card}
                imageSizes="(max-width: 1024px) 50vw, 25vw"
                className="min-h-[110px] sm:min-h-[140px]"
              />
            ))}
          </div>
        )}
      </div>

      {/* Right rail */}
      {sideCards.length > 0 && (
        <div className="col-span-2 grid grid-cols-2 gap-4 sm:col-span-4 lg:col-span-3 lg:flex lg:flex-col">
          {sideCards.map((card) => (
            <PromoCard
              key={card.id}
              card={card}
              imageSizes="(max-width: 1024px) 50vw, 25vw"
              className="min-h-[150px] sm:min-h-[190px] lg:flex-1"
            />
          ))}
        </div>
      )}
    </section>
  );
}
