"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  FiGrid,
  FiChevronLeft,
  FiChevronRight,
  FiSmartphone,
  FiShoppingBag,
  FiHome,
  FiHeart,
  FiActivity,
  FiBook,
  FiPackage,
  FiWatch,
  FiLayers,
  FiZap,
} from "react-icons/fi";

export interface CategoryFilterChipsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts?: Record<string, number>;
  totalCount?: number;
  allLabel?: string;
  className?: string;
}

const DRAG_THRESHOLD_PX = 6;

export function getCategoryFilterIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("all")) return FiGrid;
  if (n.includes("elect") || n.includes("phone") || n.includes("gadget") || n.includes("tech"))
    return FiSmartphone;
  if (n.includes("fash") || n.includes("cloth") || n.includes("wear") || n.includes("shoe") || n.includes("apparel"))
    return FiShoppingBag;
  if (n.includes("home") || n.includes("furn") || n.includes("decor") || n.includes("kitchen") || n.includes("living"))
    return FiHome;
  if (n.includes("beau") || n.includes("health") || n.includes("care") || n.includes("skin") || n.includes("cosmetic"))
    return FiHeart;
  if (n.includes("sport") || n.includes("fit") || n.includes("gym") || n.includes("outdoor"))
    return FiActivity;
  if (n.includes("book") || n.includes("stat") || n.includes("print") || n.includes("read"))
    return FiBook;
  if (n.includes("watch") || n.includes("jewel") || n.includes("lux"))
    return FiWatch;
  if (n.includes("groc") || n.includes("food") || n.includes("mart") || n.includes("organic"))
    return FiPackage;
  if (n.includes("deal") || n.includes("offer") || n.includes("flash") || n.includes("top"))
    return FiZap;
  return FiLayers;
}

export function CategoryFilterChips({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
  totalCount,
  allLabel = "All",
  className = "",
}: CategoryFilterChipsProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ startX: 0, scrollLeft: 0, moved: false });
  const [isDragging, setIsDragging] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
  };

  useEffect(() => {
    updateScrollButtons();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [categories]);

  const scrollTrack = (offset: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  // Drag-to-scroll handlers
  const onMouseDown = (e: React.MouseEvent) => {
    const el = trackRef.current;
    if (!el) return;
    dragState.current = { startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft, moved: false };
    setIsDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const el = trackRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = x - dragState.current.startX;
    if (Math.abs(walk) > DRAG_THRESHOLD_PX) {
      dragState.current.moved = true;
    }
    el.scrollLeft = dragState.current.scrollLeft - walk;
  };

  const onMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleChipClick = (categoryName: string) => {
    if (dragState.current.moved) {
      dragState.current.moved = false;
      return;
    }
    onSelectCategory(categoryName);
  };

  const isAllSelected = selectedCategory === allLabel || selectedCategory === "All Stores" || selectedCategory === "All Categories" || selectedCategory === "All";
  const AllIcon = getCategoryFilterIcon("all");

  return (
    <div className={`relative w-full ${className}`}>
      {/* Left Arrow Button with Fade */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pr-3 bg-gradient-to-r from-blue-100/95 dark:from-slate-950 via-blue-100/60 dark:via-slate-950/80 to-transparent pointer-events-none">
          <button
            type="button"
            onClick={() => scrollTrack(-260)}
            aria-label="Scroll categories left"
            className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white hover:border-primary hover:scale-110 active:scale-95 transition-all cursor-pointer"
          >
            <FiChevronLeft size={16} />
          </button>
        </div>
      )}

      {/* Categories Track */}
      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUpOrLeave}
        onMouseLeave={onMouseUpOrLeave}
        className={`flex w-full items-center gap-2 overflow-x-auto py-1 px-1 select-none no-scrollbar ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ scrollbarWidth: "none" }}
      >
        {/* All Items Chip */}
        <button
          type="button"
          onClick={() => handleChipClick(allLabel)}
          className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-bold transition-all duration-200 border shadow-2xs active:scale-95 cursor-pointer ${
            isAllSelected
              ? "bg-primary text-white border-primary shadow-primary/25 ring-2 ring-primary/20"
              : "bg-white dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-slate-800/60"
          }`}
        >
          <AllIcon
            size={14}
            className={`transition-transform ${isAllSelected ? "text-white" : "text-primary"}`}
          />
          <span>{allLabel}</span>
          {totalCount !== undefined && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                isAllSelected
                  ? "bg-white/25 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              {totalCount}
            </span>
          )}
        </button>

        {/* Dynamic Category Chips */}
        {categories
          .filter((c) => c !== allLabel && c !== "All Stores" && c !== "All Categories" && c !== "All")
          .map((catName) => {
            const isActive = selectedCategory === catName;
            const count = categoryCounts[catName];
            const Icon = getCategoryFilterIcon(catName);

            return (
              <button
                key={catName}
                type="button"
                onClick={() => handleChipClick(catName)}
                className={`group flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-bold transition-all duration-200 border shadow-2xs active:scale-95 cursor-pointer ${
                  isActive
                    ? "bg-primary text-white border-primary shadow-primary/25 ring-2 ring-primary/20"
                    : "bg-white dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon
                  size={14}
                  className={`transition-transform group-hover:scale-110 ${
                    isActive ? "text-white" : "text-primary"
                  }`}
                />
                <span>{catName}</span>
                {count !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold transition-colors ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
      </div>

      {/* Right Arrow Button with Fade */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pl-3 bg-gradient-to-l from-blue-100/95 dark:from-slate-950 via-blue-100/60 dark:via-slate-950/80 to-transparent pointer-events-none">
          <button
            type="button"
            onClick={() => scrollTrack(260)}
            aria-label="Scroll categories right"
            className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white hover:border-primary hover:scale-110 active:scale-95 transition-all cursor-pointer"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default CategoryFilterChips;
