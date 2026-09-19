"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  FiGrid,
  FiLoader,
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
import type { Category } from "@/lib/api/categories";
import { buildProductsHref, ProductsQueryState } from "@/lib/utils/product-query";
import { buildCategoryTree, CategoryNode, idOf } from "@/lib/utils/category-tree";
import { useProductFilter } from "./ProductFilterContext";

export interface CategoryChipsBarProps {
  categories: Category[];
  categoryCounts: Record<string, number>;
  totalProducts: number;
  activeCategory?: string;
  query: ProductsQueryState;
}

const DRAG_THRESHOLD_PX = 6;

function getCategoryIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("elect") || n.includes("phone") || n.includes("gadget") || n.includes("tech"))
    return FiSmartphone;
  if (n.includes("fash") || n.includes("cloth") || n.includes("wear") || n.includes("shoe"))
    return FiShoppingBag;
  if (n.includes("home") || n.includes("furn") || n.includes("decor") || n.includes("kitchen"))
    return FiHome;
  if (n.includes("beau") || n.includes("health") || n.includes("care") || n.includes("skin"))
    return FiHeart;
  if (n.includes("sport") || n.includes("fit") || n.includes("gym"))
    return FiActivity;
  if (n.includes("book") || n.includes("stat"))
    return FiBook;
  if (n.includes("watch") || n.includes("jewel") || n.includes("lux"))
    return FiWatch;
  if (n.includes("groc") || n.includes("food"))
    return FiPackage;
  if (n.includes("deal") || n.includes("offer") || n.includes("flash"))
    return FiZap;
  return FiLayers;
}

function getNodeCount(node: CategoryNode, counts: Record<string, number>): number {
  let sum = counts[node.name] ?? 0;
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      sum += getNodeCount(child, counts);
    }
  }
  return sum;
}

export function CategoryChipsBar({
  categories,
  categoryCounts,
  totalProducts,
  activeCategory,
  query,
}: CategoryChipsBarProps) {
  const trackRef1 = useRef<HTMLDivElement>(null);
  const trackRef2 = useRef<HTMLDivElement>(null);
  const dragState1 = useRef({ startX: 0, scrollLeft: 0, moved: false });
  const dragState2 = useRef({ startX: 0, scrollLeft: 0, moved: false });
  const [isDragging1, setIsDragging1] = useState(false);
  const [isDragging2, setIsDragging2] = useState(false);

  const [canScrollLeft1, setCanScrollLeft1] = useState(false);
  const [canScrollRight1, setCanScrollRight1] = useState(false);
  const [canScrollLeft2, setCanScrollLeft2] = useState(false);
  const [canScrollRight2, setCanScrollRight2] = useState(false);

  const { pendingTarget, navigateWithFilter } = useProductFilter();

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);

  // Find active root node and active child node (if any)
  const { activeRoot, activeChild } = useMemo(() => {
    if (!activeCategory) return { activeRoot: null, activeChild: null };

    const target = activeCategory.toLowerCase();

    for (const root of tree) {
      if (root.name.toLowerCase() === target || root.slug?.toLowerCase() === target) {
        return { activeRoot: root, activeChild: null };
      }
      const findChild = (node: CategoryNode): CategoryNode | null => {
        for (const child of node.children) {
          if (child.name.toLowerCase() === target || child.slug?.toLowerCase() === target) {
            return child;
          }
          const deeper = findChild(child);
          if (deeper) return deeper;
        }
        return null;
      };

      const foundChild = findChild(root);
      if (foundChild) {
        return { activeRoot: root, activeChild: foundChild };
      }
    }

    return { activeRoot: null, activeChild: null };
  }, [tree, activeCategory]);

  const updateScrollButtons1 = useCallback(() => {
    const el = trackRef1.current;
    if (!el) return;
    setCanScrollLeft1(el.scrollLeft > 8);
    setCanScrollRight1(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  const updateScrollButtons2 = useCallback(() => {
    const el = trackRef2.current;
    if (!el) return;
    setCanScrollLeft2(el.scrollLeft > 8);
    setCanScrollRight2(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  const scrollTrack1 = (distance: number) => {
    trackRef1.current?.scrollBy({ left: distance, behavior: "smooth" });
  };

  const scrollTrack2 = (distance: number) => {
    trackRef2.current?.scrollBy({ left: distance, behavior: "smooth" });
  };

  // Draggable & scroll listeners for row 1
  useEffect(() => {
    const track = trackRef1.current;
    if (!track) return;

    updateScrollButtons1();
    track.addEventListener("scroll", updateScrollButtons1, { passive: true });
    window.addEventListener("resize", updateScrollButtons1);

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.pageX - dragState1.current.startX;
      if (Math.abs(delta) > DRAG_THRESHOLD_PX) dragState1.current.moved = true;
      track.scrollLeft = dragState1.current.scrollLeft - delta;
    };

    const handleMouseUp = () => {
      setIsDragging1(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      dragState1.current = { startX: e.pageX, scrollLeft: track.scrollLeft, moved: false };
      setIsDragging1(true);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    };

    track.addEventListener("mousedown", handleMouseDown);
    return () => {
      track.removeEventListener("scroll", updateScrollButtons1);
      window.removeEventListener("resize", updateScrollButtons1);
      track.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [updateScrollButtons1, tree]);

  // Draggable & scroll listeners for row 2
  useEffect(() => {
    const track = trackRef2.current;
    if (!track) return;

    updateScrollButtons2();
    track.addEventListener("scroll", updateScrollButtons2, { passive: true });
    window.addEventListener("resize", updateScrollButtons2);

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.pageX - dragState2.current.startX;
      if (Math.abs(delta) > DRAG_THRESHOLD_PX) dragState2.current.moved = true;
      track.scrollLeft = dragState2.current.scrollLeft - delta;
    };

    const handleMouseUp = () => {
      setIsDragging2(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      dragState2.current = { startX: e.pageX, scrollLeft: track.scrollLeft, moved: false };
      setIsDragging2(true);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    };

    track.addEventListener("mousedown", handleMouseDown);
    return () => {
      track.removeEventListener("scroll", updateScrollButtons2);
      window.removeEventListener("resize", updateScrollButtons2);
      track.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [updateScrollButtons2, activeRoot]);

  const handleRowClick = (
    e: React.MouseEvent,
    href: string,
    targetId: string,
    dragState: React.MutableRefObject<{ moved: boolean }>
  ) => {
    if (dragState.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragState.current.moved = false;
      return;
    }
    e.preventDefault();
    navigateWithFilter(href, targetId);
  };

  const isAllPending = pendingTarget === "cat-all";

  return (
    <div className="flex w-full flex-col gap-2.5">
      {/* 🟢 Level 1: Main / Parent Category Chips with Floating Scroll Arrows */}
      <div className="group/chips relative w-full overflow-hidden">
        {/* Left Arrow Button */}
        {canScrollLeft1 && (
          <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pr-3 bg-gradient-to-r from-background via-background/80 to-transparent">
            <button
              type="button"
              onClick={() => scrollTrack1(-260)}
              aria-label="Scroll categories left"
              className="grid h-8 w-8 place-items-center rounded-full bg-surface border border-border/80 shadow-md text-text hover:bg-primary hover:text-white hover:border-primary hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <FiChevronLeft size={16} />
            </button>
          </div>
        )}

        {/* Categories Track */}
        <div
          ref={trackRef1}
          className={`flex w-full items-center gap-2 overflow-x-auto py-1 px-1 select-none ${
            isDragging1 ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ scrollbarWidth: "none" }}
        >
          {/* All Categories Button */}
          <Link
            href={buildProductsHref(query, { category: undefined })}
            onClick={(e) =>
              handleRowClick(
                e,
                buildProductsHref(query, { category: undefined }),
                "cat-all",
                dragState1
              )
            }
            draggable={false}
            className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-bold transition-all duration-200 border shadow-2xs active:scale-95 ${
              !activeCategory
                ? "bg-primary text-white border-primary shadow-primary/25 ring-2 ring-primary/20"
                : "bg-surface text-text border-border/70 hover:border-primary/40 hover:bg-muted-bg"
            } ${isAllPending ? "ring-2 ring-primary/50 ring-offset-1" : ""}`}
          >
            {isAllPending ? (
              <FiLoader className="animate-spin text-white" size={14} />
            ) : (
              <FiGrid size={14} />
            )}
            <span>All Categories</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                !activeCategory ? "bg-white/25 text-white" : "bg-muted-bg text-muted"
              }`}
            >
              {totalProducts}
            </span>
          </Link>

          {/* Root Categories */}
          {tree.map((root) => {
            const isRootActive = activeRoot?.id === root.id || activeRoot?.name === root.name;
            const isExactMatch = activeCategory?.toLowerCase() === root.name.toLowerCase();
            const rootCount = getNodeCount(root, categoryCounts);
            const isThisPending = pendingTarget === `cat-${root.name}`;
            const Icon = getCategoryIcon(root.name);
            const targetHref = buildProductsHref(query, {
              category: isExactMatch ? undefined : root.name,
            });

            return (
              <Link
                key={idOf(root)}
                href={targetHref}
                onClick={(e) =>
                  handleRowClick(e, targetHref, `cat-${root.name}`, dragState1)
                }
                draggable={false}
                className={`group flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-bold transition-all duration-200 border shadow-2xs active:scale-95 ${
                  isRootActive
                    ? "bg-primary text-white border-primary shadow-primary/25 ring-2 ring-primary/20"
                    : "bg-surface text-text border-border/70 hover:border-primary/40 hover:bg-muted-bg"
                } ${isThisPending ? "ring-2 ring-primary/50 opacity-90" : ""}`}
              >
                {isThisPending ? (
                  <FiLoader
                    className={`animate-spin ${isRootActive ? "text-white" : "text-primary"}`}
                    size={13}
                  />
                ) : (
                  <Icon
                    size={14}
                    className={`transition-transform group-hover:scale-110 ${
                      isRootActive ? "text-white" : "text-primary"
                    }`}
                  />
                )}
                <span>{root.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold transition-colors ${
                    isRootActive ? "bg-white/25 text-white" : "bg-muted-bg text-muted"
                  }`}
                >
                  {rootCount}
                </span>
                {root.children && root.children.length > 0 && (
                  <span
                    className={`text-[9px] font-bold opacity-70 ${
                      isRootActive ? "text-white" : "text-muted"
                    }`}
                  >
                    • {root.children.length}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        {canScrollRight1 && (
          <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pl-3 bg-gradient-to-l from-background via-background/80 to-transparent">
            <button
              type="button"
              onClick={() => scrollTrack1(260)}
              aria-label="Scroll categories right"
              className="grid h-8 w-8 place-items-center rounded-full bg-surface border border-border/80 shadow-md text-text hover:bg-primary hover:text-white hover:border-primary hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* 🟢 Level 2: Sub-categories Bar with Floating Scroll Arrows */}
      {activeRoot && activeRoot.children && activeRoot.children.length > 0 && (
        <div className="group/subs relative w-full rounded-2xl bg-surface/70 border border-primary/20 p-2 px-3 shadow-2xs backdrop-blur-xs animate-in fade-in slide-in-from-top-1.5 duration-200">
          <div className="flex items-center gap-2">
            <div className="flex shrink-0 items-center gap-1.5 pr-2 text-xs font-black text-primary border-r border-border/70">
              <span>{activeRoot.name}</span>
              <FiChevronRight size={13} className="text-muted" />
            </div>

            <div className="relative flex-1 overflow-hidden">
              {/* Left Sub Arrow */}
              {canScrollLeft2 && (
                <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-2 bg-gradient-to-r from-surface via-surface/90 to-transparent">
                  <button
                    type="button"
                    onClick={() => scrollTrack2(-180)}
                    aria-label="Scroll sub-categories left"
                    className="grid h-6 w-6 place-items-center rounded-full bg-background border border-border text-text hover:bg-primary hover:text-white hover:scale-110 transition-all cursor-pointer shadow-xs"
                  >
                    <FiChevronLeft size={12} />
                  </button>
                </div>
              )}

              <div
                ref={trackRef2}
                className={`flex items-center gap-1.5 overflow-x-auto select-none py-0.5 ${
                  isDragging2 ? "cursor-grabbing" : "cursor-grab"
                }`}
                style={{ scrollbarWidth: "none" }}
              >
                {/* "All [Parent]" pill */}
                <Link
                  href={buildProductsHref(query, { category: activeRoot.name })}
                  onClick={(e) =>
                    handleRowClick(
                      e,
                      buildProductsHref(query, { category: activeRoot.name }),
                      `cat-all-${activeRoot.name}`,
                      dragState2
                    )
                  }
                  draggable={false}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                    !activeChild
                      ? "bg-primary/15 text-primary font-black border border-primary/40 shadow-xs"
                      : "bg-muted-bg text-text hover:bg-border/60"
                  }`}
                >
                  {pendingTarget === `cat-all-${activeRoot.name}` ? (
                    <FiLoader size={11} className="animate-spin text-primary" />
                  ) : null}
                  <span>All {activeRoot.name}</span>
                  <span className="text-[10px] text-muted">
                    ({getNodeCount(activeRoot, categoryCounts)})
                  </span>
                </Link>

                {/* Sub-category chips */}
                {activeRoot.children.map((child) => {
                  const isChildActive =
                    activeChild?.id === child.id || activeChild?.name === child.name;
                  const childCount = getNodeCount(child, categoryCounts);
                  const isChildPending = pendingTarget === `cat-${child.name}`;
                  const childHref = buildProductsHref(query, {
                    category: isChildActive ? activeRoot.name : child.name,
                  });

                  return (
                    <Link
                      key={idOf(child)}
                      href={childHref}
                      onClick={(e) =>
                        handleRowClick(e, childHref, `cat-${child.name}`, dragState2)
                      }
                      draggable={false}
                      className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                        isChildActive
                          ? "bg-primary text-white shadow-xs shadow-primary/20"
                          : "bg-muted-bg text-text hover:bg-border/60"
                      } ${isChildPending ? "ring-2 ring-primary/40 opacity-90" : ""}`}
                    >
                      {isChildPending ? (
                        <FiLoader
                          className={`animate-spin ${
                            isChildActive ? "text-white" : "text-primary"
                          }`}
                          size={11}
                        />
                      ) : null}
                      <span>{child.name}</span>
                      <span
                        className={`text-[10px] ${
                          isChildActive ? "text-white/80" : "text-muted font-medium"
                        }`}
                      >
                        ({childCount})
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Right Sub Arrow */}
              {canScrollRight2 && (
                <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-2 bg-gradient-to-l from-surface via-surface/90 to-transparent">
                  <button
                    type="button"
                    onClick={() => scrollTrack2(180)}
                    aria-label="Scroll sub-categories right"
                    className="grid h-6 w-6 place-items-center rounded-full bg-background border border-border text-text hover:bg-primary hover:text-white hover:scale-110 transition-all cursor-pointer shadow-xs"
                  >
                    <FiChevronRight size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}