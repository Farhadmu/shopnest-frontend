"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaChevronRight, FaGift } from "react-icons/fa";
import { getCategories, type Category } from "@/lib/api/categories";

const FALLBACK_IMAGE = "/main-bg.png";

function CategoryImage({ category }: { category: Category }) {
  const [src, setSrc] = useState(category.image || FALLBACK_IMAGE);

  return (
    <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md transition-transform duration-300 group-hover:scale-105 dark:border-slate-800 dark:bg-slate-800 sm:h-32 sm:w-32">
      {src ? (
        <img src={src} alt={category.name} className="h-full w-full object-cover" onError={() => setSrc(FALLBACK_IMAGE)} />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-primary"><FaGift size={28} /></div>
      )}
    </div>
  );
}

export default function ShopByCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((items) => {
        if (!cancelled) setCategories(items.filter((category) => !category.parent));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const updateButtons = () => {
      const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
      setAtStart(carousel.scrollLeft <= 2);
      setAtEnd(maxScrollLeft <= 2 || carousel.scrollLeft >= maxScrollLeft - 2);
    };

    const frame = requestAnimationFrame(updateButtons);
    carousel.addEventListener("scroll", updateButtons, { passive: true });
    const resizeObserver = new ResizeObserver(updateButtons);
    resizeObserver.observe(carousel);

    return () => {
      cancelAnimationFrame(frame);
      carousel.removeEventListener("scroll", updateButtons);
      resizeObserver.disconnect();
    };
  }, [categories]);

  const scrollCategories = (direction: "previous" | "next") => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.scrollBy({
      left: direction === "next" ? carousel.clientWidth : -carousel.clientWidth,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-12">
      <div className="mb-8 flex items-end justify-between px-4 sm:px-0">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-[2px] w-8 rounded-full bg-primary" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">Discover Categories</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">Shop by category</h2>
          <p className="mt-3 max-w-md text-sm font-medium text-slate-500 dark:text-slate-400">Explore our collections and find exactly what you need.</p>
        </div>
        <Link href="/products" className="group hidden items-center gap-2 rounded-full border border-primary/20 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary hover:text-white sm:flex">
          View all <FaChevronRight size={10} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-hidden px-12 sm:px-14 lg:px-16">
          {[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-52 w-36 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />)}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">Categories are temporarily unavailable.</div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">No categories found.</div>
      ) : (
        <div className="flex min-w-0 items-center gap-2 px-1 sm:gap-3 sm:px-2">
          <button
            type="button"
            aria-label="Previous categories"
            onClick={() => scrollCategories("previous")}
            disabled={atStart}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>

          <div ref={carouselRef} className="category-carousel min-w-0 flex-1 overflow-x-auto scroll-smooth">
            <div className="flex w-full gap-4 py-2 sm:gap-5 lg:gap-6">
              {categories.map((category) => (
                <article key={category.id} className="group flex min-w-0 shrink-0 basis-[calc((100%_-_1rem)/2)] flex-col items-center text-center sm:basis-[calc((100%_-_7.5rem)/4)] lg:basis-[calc((100%_-_9rem)/7)]">
                  <Link href={`/products?category=${encodeURIComponent(category.slug)}`} className="flex w-full flex-col items-center">
                    <CategoryImage category={category} />
                    <h3 className="mt-4 line-clamp-2 min-h-10 w-full text-sm font-extrabold text-slate-900 dark:text-white">{category.name}</h3>
                    <span className="mt-2 text-xs font-bold text-primary transition-colors group-hover:text-primary/70">Browse this category</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>

          <button
            type="button"
            aria-label="Next categories"
            onClick={() => scrollCategories("next")}
            disabled={atEnd}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}