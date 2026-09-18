"use client";

import React, { useState, useEffect, useRef } from "react";
import { FiSliders, FiChevronDown, FiChevronUp } from "react-icons/fi";
import type { Product } from "@/lib/api/products";

export interface ProductSpecsTableProps {
  product: Product;
  overviewHeight?: number | null;
}

export interface SpecVariant {
  name: string;
  sku?: string;
  stock?: number;
  price?: number;
  color?: string;
  swatch?: string;
}

export function extractVariants(product: Product): SpecVariant[] {
  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants.map((v: any) => ({
      name: v.name || "",
      sku: v.sku,
      stock: typeof v.stock === "number" ? v.stock : Number(v.stock) || 0,
      price: typeof v.price === "number" ? v.price : Number(v.price) || undefined,
      color: v.color || v.swatch,
      swatch: v.swatch || v.color,
    }));
  }

  return [];
}

const DEFAULT_MOBILE_SPECS = 6;
const ESTIMATED_ROW_HEIGHT = 41;
const ESTIMATED_HEADER_HEIGHT = 65;
const ESTIMATED_FOOTER_HEIGHT = 48;
const ESTIMATED_PADDING = 40;

export function ProductSpecsTable({ product, overviewHeight }: ProductSpecsTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const firstRowRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // Filter out internal/reserved keys or raw JSON strings so the specs table stays clean
  const regularSpecs = Object.entries(product.specifications || {}).filter(([key, val]) => {
    const lower = key.toLowerCase().trim();
    if (lower === "variants" || lower === "package contents") return false;
    const strVal = String(val ?? "").trim();
    if (strVal.startsWith("[{") || strVal.startsWith("{\"")) return false;
    return true;
  });

  if (regularSpecs.length === 0) {
    return null;
  }

  // Calculate how many specs can fit to dynamically match overview height
  let dynamicVisibleCount = DEFAULT_MOBILE_SPECS;

  if (isDesktop && overviewHeight && overviewHeight > 0) {
    const headerH = headerRef.current?.offsetHeight ?? ESTIMATED_HEADER_HEIGHT;
    const footerH = buttonRef.current?.offsetHeight ?? ESTIMATED_FOOTER_HEIGHT;
    const rowH = firstRowRef.current?.offsetHeight ?? ESTIMATED_ROW_HEIGHT;

    // Check if ALL specs fit within overviewHeight
    const totalHeightIfAllShown = headerH + ESTIMATED_PADDING + (regularSpecs.length * rowH);
    if (totalHeightIfAllShown <= overviewHeight + 25) {
      dynamicVisibleCount = regularSpecs.length;
    } else {
      const availableForRows = overviewHeight - headerH - footerH - ESTIMATED_PADDING;
      dynamicVisibleCount = Math.max(4, Math.floor(availableForRows / rowH));
    }
  }

  const hasMoreSpecs = regularSpecs.length > dynamicVisibleCount;
  const displayedSpecs = isExpanded || !hasMoreSpecs
    ? regularSpecs
    : regularSpecs.slice(0, dynamicVisibleCount);

  return (
    <div className="flex w-full flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all">
      {/* Header */}
      <div ref={headerRef} className="flex items-center justify-between border-b border-border pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <FiSliders size={18} />
          </div>
          <div>
            <h3 className="text-base font-black text-text">Technical Specs</h3>
            <p className="text-[11px] font-medium text-muted">Verified manufacturer specifications</p>
          </div>
        </div>
        <span className="rounded-full bg-muted-bg px-2.5 py-0.5 text-xs font-bold text-muted">
          {regularSpecs.length} Specs
        </span>
      </div>

      {/* Specifications list */}
      <div className="flex flex-col divide-y divide-border/60 text-sm">
        {displayedSpecs.map(([key, value], idx) => (
          <div
            key={key}
            ref={idx === 0 ? firstRowRef : undefined}
            className="flex items-center justify-between py-2.5 px-1.5 transition-colors hover:bg-muted-bg/40 rounded-md"
          >
            <span className="text-xs font-semibold text-muted">{key}</span>
            <span className="text-xs font-bold text-text text-right max-w-[60%] truncate sm:max-w-[70%]">
              {String(value)}
            </span>
          </div>
        ))}
      </div>

      {/* Show More / Show Less Collapsible Toggle */}
      {hasMoreSpecs && (
        <div ref={buttonRef} className="mt-4 pt-3 border-t border-border/60">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="group flex w-full items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-muted-bg/50 py-2.5 text-xs font-bold text-text transition-all hover:border-primary/40 hover:bg-muted-bg hover:text-primary active:scale-[0.99] cursor-pointer"
          >
            <span>
              {isExpanded
                ? "Show fewer specifications"
                : `Show all ${regularSpecs.length} specifications (+${regularSpecs.length - dynamicVisibleCount} more)`}
            </span>
            {isExpanded ? (
              <FiChevronUp size={15} className="transition-transform group-hover:-translate-y-0.5" />
            ) : (
              <FiChevronDown size={15} className="transition-transform group-hover:translate-y-0.5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}