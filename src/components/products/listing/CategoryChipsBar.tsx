"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FiGrid } from "react-icons/fi";
import type { Category } from "@/lib/api/categories";
import { buildProductsHref, ProductsQueryState } from "@/lib/utils/product-query";

export interface CategoryChipsBarProps {
  categories: Category[];
  /** Real per-category counts, e.g. `{ "Electronics": 19, "Fashion": 15 }`. */
  categoryCounts: Record<string, number>;
  totalProducts: number;
  activeCategory?: string;
  query: ProductsQueryState;
}

const DRAG_THRESHOLD_PX = 6;

export function CategoryChipsBar({
  categories,
  categoryCounts,
  totalProducts,
  activeCategory,
  query,
}: CategoryChipsBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ startX: 0, scrollLeft: 0, moved: false });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.pageX - dragState.current.startX;
      if (Math.abs(delta) > DRAG_THRESHOLD_PX) dragState.current.moved = true;
      track.scrollLeft = dragState.current.scrollLeft - delta;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Only the primary button starts a drag.
      if (e.button !== 0) return;
      dragState.current = { startX: e.pageX, scrollLeft: track.scrollLeft, moved: false };
      setIsDragging(true);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    };

    track.addEventListener("mousedown", handleMouseDown);
    return () => {
      track.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Only blocks the click that immediately follows an actual drag (movement
  // past the threshold) — a plain click always reaches the <Link> normally.
  const onClickCapture = (e: React.MouseEvent) => {
    if (dragState.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragState.current.moved = false;
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div
        ref={trackRef}
        onClickCapture={onClickCapture}
        className={`flex w-full items-center gap-2 overflow-x-auto pb-1 pr-10 ${
          isDragging ? "cursor-grabbing select-none" : "cursor-grab"
        }`}
        style={{ scrollbarWidth: "thin" }}
      >
        <Link
          href={buildProductsHref(query, { category: undefined })}
          draggable={false}
          className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold shadow-sm transition-colors ${
            !activeCategory ? "bg-primary text-white" : "bg-surface text-text hover:bg-muted-bg"
          }`}
        >
          <FiGrid size={14} />
          All Categories
          <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">{totalProducts}</span>
        </Link>

        {categories.map((cat) => {
          const isActive = activeCategory === cat.name;
          const count = categoryCounts[cat.name] ?? 0;
          return (
            <Link
              key={cat.id}
              href={buildProductsHref(query, { category: isActive ? undefined : cat.name })}
              draggable={false}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold shadow-sm transition-colors ${
                isActive ? "bg-primary text-white" : "bg-surface text-text hover:bg-muted-bg"
              }`}
            >
              {cat.name}
              <span className={isActive ? "text-white/80" : "text-muted"}>({count})</span>
            </Link>
          );
        })}
      </div>

      {/* Fade hint on the right edge so it's obvious the row keeps scrolling
          instead of looking like a cut-off/broken layout. */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-linear-to-l from-background to-transparent" />
    </div>
  );
}