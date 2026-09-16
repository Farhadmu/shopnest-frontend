"use client";

import { useState, type ComponentType } from "react";
import {
  BookOpen,
  ChevronDown,
  Cpu,
  Dumbbell,
  LayoutGrid,
  Palette,
  Shirt,
  Sofa,
  Sparkles,
} from "lucide-react";
import type { CategoryItem } from "@/types/category";
import type { HeroBanner } from "@/lib/api/hero-banners";
import { BannerTile } from "./BannerTile";
import type { EditSlot } from "./types";

/** Best-effort icon + tint for a category, matched by keyword. Falls back
 * to a neutral grid icon when nothing matches — purely cosmetic, no data
 * dependency beyond the category's own name. */
const CATEGORY_ICON_RULES: { test: RegExp; icon: ComponentType<{ className?: string }>; tint: string }[] = [
  { test: /art|craft/i, icon: Palette, tint: "bg-accent/10 text-accent" },
  { test: /electronic|gadget|tech|computer|phone/i, icon: Cpu, tint: "bg-primary/10 text-primary" },
  { test: /fashion|apparel|cloth|wear/i, icon: Shirt, tint: "bg-warm/10 text-warm" },
  { test: /home|living|furniture|decor/i, icon: Sofa, tint: "bg-primary/10 text-primary" },
  { test: /beauty|cosmetic|wellness|personal care/i, icon: Sparkles, tint: "bg-accent/10 text-accent" },
  { test: /book|stationery/i, icon: BookOpen, tint: "bg-muted-bg text-muted" },
  { test: /sport|outdoor|fitness/i, icon: Dumbbell, tint: "bg-muted-bg text-muted" },
];

function iconForCategory(name: string) {
  return CATEGORY_ICON_RULES.find((rule) => rule.test.test(name)) ?? { icon: LayoutGrid, tint: "bg-muted-bg text-muted" };
}

export interface CategoryBanners {
  hero: HeroBanner | null;
  side: (HeroBanner | null)[];
  bottom: (HeroBanner | null)[];
}

interface CategoryBannerGroupProps {
  category: CategoryItem;
  categoryId: string;
  subcategoryCount: number;
  banners: CategoryBanners;
  defaultOpen?: boolean;
  onEditSlot: (slot: EditSlot) => void;
  onToggleActive: (banner: HeroBanner) => void;
}

export function CategoryBannerGroup({
  category,
  categoryId,
  subcategoryCount,
  banners,
  defaultOpen = false,
  onEditSlot,
  onToggleActive,
}: CategoryBannerGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const hasHero = Boolean(banners.hero);
  const { icon: CategoryIcon, tint } = iconForCategory(category.name);

  return (
    <div className="overflow-hidden rounded-xl bg-surface shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted-bg/40 md:px-5"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${tint}`}>
            <CategoryIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <span className="truncate font-semibold text-text">{category.name}</span>
            <div className="mt-0.5 truncate text-xs text-muted">{subcategoryCount} Subcategories</div>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <span
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              hasHero ? "bg-primary/10 text-primary" : "bg-muted-bg text-muted"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${hasHero ? "bg-primary" : "bg-muted"}`} />
            {hasHero ? "Banner Active" : "No Banner"}
          </span>
          <ChevronDown className={`h-5 w-5 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-5 pt-4 md:px-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-10">
            <div className="flex flex-col gap-3 md:col-span-7">
              <BannerTile
                banner={banners.hero}
                variant="hero"
                onEdit={() => onEditSlot({ categoryId, categoryName: category.name, placement: "hero", banner: banners.hero })}
              />
              <div className="grid grid-cols-2 gap-3">
                <BannerTile
                  banner={banners.bottom[0] ?? null}
                  variant="bottom"
                  onEdit={() =>
                    onEditSlot({ categoryId, categoryName: category.name, placement: "bottom", banner: banners.bottom[0] ?? null })
                  }
                />
                <BannerTile
                  banner={banners.bottom[1] ?? null}
                  variant="bottom"
                  onEdit={() =>
                    onEditSlot({ categoryId, categoryName: category.name, placement: "bottom", banner: banners.bottom[1] ?? null })
                  }
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 md:col-span-3">
              <BannerTile
                banner={banners.side[0] ?? null}
                variant="side"
                onEdit={() => onEditSlot({ categoryId, categoryName: category.name, placement: "side", banner: banners.side[0] ?? null })}
              />
              <BannerTile
                banner={banners.side[1] ?? null}
                variant="side"
                onEdit={() => onEditSlot({ categoryId, categoryName: category.name, placement: "side", banner: banners.side[1] ?? null })}
              />
            </div>
          </div>

          {banners.hero && (
            <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 select-none">
              <span className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={banners.hero.isActive}
                  onChange={() => banners.hero && onToggleActive(banners.hero)}
                  className="peer sr-only"
                />
                <span className="h-5 w-9 rounded-full bg-muted-bg transition-colors peer-checked:bg-primary" />
                <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-surface shadow transition-transform peer-checked:translate-x-4" />
              </span>
              <span className="text-sm font-medium text-muted">Active (Toggle to Deactivate)</span>
            </label>
          )}
        </div>
      )}
    </div>
  );
}
