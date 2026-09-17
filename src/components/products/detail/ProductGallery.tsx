"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiShield, FiRotateCcw, FiCheckCircle, FiCamera } from "react-icons/fi";

export interface ProductGalleryProps {
  images: string[];
  title: string;
}

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg width='600' height='600' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23e9edf4'/%3E%3Ctext x='50%25' y='50%25' font-size='28' text-anchor='middle' fill='%2364748b' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const gallery = images.length > 0 ? images : [FALLBACK_IMAGE];
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 shadow-sm lg:sticky lg:top-24">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted-bg">
        <Image
          src={gallery[activeIndex]}
          alt={title}
          fill
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="object-cover"
          priority
        />
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-surface/90 px-2.5 py-1 text-[10px] font-black text-primary shadow-sm backdrop-blur">
          <FiShield size={12} /> Authentic
        </span>
      </div>

      {/* Thumbnail strip. Always rendered (not just when there's more than
          one image): a single-image product shows the one real photo plus
          "coming soon" placeholder tiles instead of leaving an empty gap,
          so the layout never looks broken.
          TODO(seller-dashboard): encourage/require 3+ product photos on
          upload so real thumbnails fill this row instead of placeholders. */}
      <div className="grid grid-cols-4 gap-2">
        {gallery.map((src, idx) => (
          <button
            key={`${src}-${idx}`}
            type="button"
            onClick={() => setActiveIndex(idx)}
            aria-label={`View image ${idx + 1}`}
            className={`relative aspect-square overflow-hidden rounded-lg bg-muted-bg transition-all ${
              idx === activeIndex ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
            }`}
          >
            <Image src={src} alt={`${title} thumbnail ${idx + 1}`} fill sizes="120px" className="object-cover" />
          </button>
        ))}

        {gallery.length < 4 &&
          Array.from({ length: 4 - gallery.length }).map((_, idx) => (
            <div
              key={`placeholder-${idx}`}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-muted-bg/50 text-muted"
            >
              <FiCamera size={16} />
              <span className="text-[9px] font-semibold leading-none">More soon</span>
            </div>
          ))}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3 text-xs font-semibold text-muted">
        <span className="flex items-center gap-1">
          <FiShield size={14} className="text-primary" /> 1Y Warranty
        </span>
        <span className="flex items-center gap-1">
          <FiRotateCcw size={14} className="text-primary" /> 7-Day Returns
        </span>
        <span className="flex items-center gap-1">
          <FiCheckCircle size={14} className="text-primary" /> 100% Genuine
        </span>
      </div>
    </div>
  );
}