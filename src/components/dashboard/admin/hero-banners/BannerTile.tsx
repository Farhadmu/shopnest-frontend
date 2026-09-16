"use client";

import Image from "next/image";
import { ImageOff, Pencil, Plus } from "lucide-react";
import type { HeroBanner } from "@/lib/api/hero-banners";

export type TileVariant = "hero" | "bottom" | "side";

/** Sizing classes copied straight from components/home/Banner.tsx so each
 * admin tile is the same shape (and therefore crops the image the same
 * way) as it will actually appear on the storefront — a fixed aspect
 * ratio here would crop banners differently than the live page does. */
const SIZE_BY_VARIANT: Record<TileVariant, string> = {
  hero: "min-h-56 sm:min-h-72 lg:min-h-80", // HeroCarousel
  bottom: "min-h-28 sm:min-h-36", // bottom PromoCard
  side: "min-h-36 sm:min-h-48 lg:flex-1", // side PromoCard
};

/** On the storefront, hero text is vertically centered but side/bottom
 * PromoCard text sits at the top of the card — match that here. */
const TEXT_ALIGN_BY_VARIANT: Record<TileVariant, string> = {
  hero: "justify-center",
  bottom: "justify-start",
  side: "justify-start",
};

interface BannerTileProps {
  banner: HeroBanner | null;
  variant: TileVariant;
  onEdit: () => void;
}

/**
 * Renders a single banner slot exactly the way it will look on the
 * homepage (full-bleed photo, dark overlay, text layered on top) so the
 * admin preview is never out of sync with `components/home/Banner.tsx`.
 */
export function BannerTile({ banner, variant, onEdit }: BannerTileProps) {
  if (!banner) {
    return (
      <button
        type="button"
        onClick={onEdit}
        className={`group relative flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted-bg/40 p-3 text-center transition-colors hover:bg-muted-bg/70 ${SIZE_BY_VARIANT[variant]}`}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-muted">
          <ImageOff className="h-4 w-4" />
        </span>
        <span className="text-xs font-medium text-muted">No banner</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
          <Plus className="h-3.5 w-3.5" />
        </span>
      </button>
    );
  }

  const isLight = banner.textTheme !== "dark";
  const customTextColor = isLight ? banner.lightTextColor : banner.darkTextColor;
  const customButtonColor = isLight ? banner.lightButtonColor : banner.darkButtonColor;
  const overlayStyle = banner.overlayColor
    ? { backgroundColor: banner.overlayColor, opacity: (banner.overlayOpacity ?? 50) / 100 }
    : undefined;

  const titleSize = variant === "hero" ? "text-lg md:text-xl" : "text-sm md:text-base";
  const subtitleSize = variant === "hero" ? "text-xs md:text-sm" : "text-[11px] md:text-xs";

  return (
    <div className={`group relative w-full overflow-hidden rounded-lg shadow-sm ${SIZE_BY_VARIANT[variant]}`}>
      <Image
        src={banner.imageUrl}
        alt={banner.title || "Banner"}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover"
      />
      <div
        className={`absolute inset-0 ${overlayStyle ? "" : isLight ? "bg-secondary/60" : "bg-surface/70"}`}
        style={overlayStyle}
      />
      <div
        className={`relative z-10 flex h-full flex-col items-start gap-1 p-3 md:p-4 ${TEXT_ALIGN_BY_VARIANT[variant]} ${
          variant === "hero" ? "max-w-[80%]" : "max-w-full"
        }`}
      >
        <h4
          className={`font-bold leading-tight ${titleSize} ${isLight ? "text-surface" : "text-text"}`}
          style={customTextColor ? { color: customTextColor } : undefined}
        >
          {banner.title}
          {banner.highlight && <span className={isLight ? "text-warm" : "text-primary"}> {banner.highlight}</span>}
        </h4>
        {banner.subtitle && (
          <p
            className={`font-medium leading-snug ${subtitleSize} ${isLight ? "text-surface/90" : "text-muted"}`}
            style={customTextColor ? { color: customTextColor } : undefined}
          >
            {banner.subtitle}
          </p>
        )}
        {banner.description && variant === "hero" && (
          <p className="line-clamp-2 text-[11px] leading-relaxed text-surface/70">{banner.description}</p>
        )}
        {banner.buttonText && (
          <span
            className={`mt-1.5 inline-block rounded-md px-2.5 py-1 text-[10px] font-bold tracking-wide md:px-3 md:py-1.5 md:text-[11px] ${
              customButtonColor ? "text-white" : isLight ? "bg-surface text-text" : "bg-primary text-surface"
            }`}
            style={customButtonColor ? { backgroundColor: customButtonColor } : undefined}
          >
            {banner.buttonText}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit banner"
        className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-100 transition-all hover:bg-primary sm:opacity-0 sm:group-hover:opacity-100"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      {!banner.isActive && (
        <span className="absolute left-2 top-2 z-20 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
          Inactive
        </span>
      )}
    </div>
  );
}
