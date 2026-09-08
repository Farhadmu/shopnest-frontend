"use client";

import { FaBoxOpen, FaImage, FaLightbulb, FaShieldAlt } from "react-icons/fa";
import type { VariantRow } from "@/types/product-form";

interface LivePreviewSidebarProps {
  images: string[];
  title: string;
  selling: number;
  regular: number;
  discountPct: number;
  variants: VariantRow[];
  escrow: string;
  effectiveStock: number;
  listingHealth: number;
  titleLength: number;
  imagesCount: number;
  specCount: number;
}

export function LivePreviewSidebar({
  images,
  title,
  selling,
  regular,
  discountPct,
  variants,
  escrow,
  effectiveStock,
  listingHealth,
  titleLength,
  imagesCount,
  specCount,
}: LivePreviewSidebarProps) {
  return (
    <div className="sticky top-20 flex flex-col gap-5">
      {/* Live PDP mirror */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <h3 className="text-sm font-black text-text">Live PDP Mirror</h3>
          </div>
          <span className="rounded bg-muted-bg px-2 py-0.5 text-[10px] font-bold text-muted">
            Customer view
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-background">
          <div className="relative aspect-square bg-muted-bg">
            {images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[0]} alt="Live preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted">
                <FaImage size={28} />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-1 bg-muted-bg/60 p-1.5">
              {images.slice(0, 4).map((src, idx) => (
                <div
                  key={idx}
                  className={`aspect-square overflow-hidden rounded ${
                    idx === 0 ? "ring-2 ring-primary" : "opacity-70"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
          <div className="space-y-2 p-3">
            <p className="line-clamp-2 text-sm font-bold leading-snug text-text">
              {title || "Product title placeholder"}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-primary">৳{selling.toLocaleString()}</span>
              {discountPct > 0 && (
                <>
                  <span className="text-sm text-muted line-through">৳{regular.toLocaleString()}</span>
                  <span className="rounded bg-error/10 px-1.5 py-0.5 text-[10px] font-bold text-error">
                    -{discountPct}%
                  </span>
                </>
              )}
            </div>
            {variants.length > 0 && (
              <div className="flex items-center gap-1.5 pt-1">
                {variants.slice(0, 6).map((v) => (
                  <span
                    key={v.id}
                    className="h-5 w-5 rounded-full border border-border"
                    style={{ backgroundColor: v.swatch }}
                    title={v.name}
                  />
                ))}
              </div>
            )}
            <div className="space-y-1 rounded-lg bg-muted-bg/60 p-2 text-[11px] text-text">
              <div className="flex items-center gap-1.5">
                <FaShieldAlt size={11} className="text-primary" /> {escrow}
              </div>
              <div className="flex items-center gap-1.5">
                <FaBoxOpen size={11} className="text-primary" />
                {effectiveStock > 0 ? `In stock · ${effectiveStock} units` : "Out of stock"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Listing diagnostic */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-black text-text">Listing Health Diagnostic</span>
          <span className="text-xs font-bold text-primary">
            {listingHealth >= 80 ? "Optimal" : listingHealth >= 50 ? "Good" : "Needs work"}
          </span>
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted">Title length:</span>
            <span className="font-semibold text-text">{titleLength}/120 chars</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Gallery images:</span>
            <span className="font-semibold text-text">{imagesCount} added</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Tech specs depth:</span>
            <span className="font-semibold text-text">{specCount} attributes</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Escrow protection:</span>
            <span className="font-semibold text-primary">Active</span>
          </div>
        </div>
      </div>

      {/* Pro tip */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-accent/20 bg-accent/10 p-4">
        <FaLightbulb className="mt-0.5 shrink-0 text-accent" />
        <div>
          <h4 className="text-xs font-black text-text">Pro Seller Growth Tip</h4>
          <p className="mt-0.5 text-xs leading-5 text-muted">
            Listings with complete technical spec tables and 3+ images convert noticeably better and see
            fewer returns.
          </p>
        </div>
      </div>
    </div>
  );
}