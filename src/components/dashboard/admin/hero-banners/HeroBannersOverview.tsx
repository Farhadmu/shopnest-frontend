"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownAZ,
  ArrowUpZA,
  ChevronRight,
  Image as ImageIcon,
  Info,
  Layers,
  Plus,
  Search,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import type { CategoryItem } from "@/types/category";
import { getAllHeroBannersForAdmin, updateHeroBanner, type HeroBanner } from "@/lib/api/hero-banners";
import { idOf } from "@/lib/utils/category-tree";
import { CategoryBannerGroup, type CategoryBanners } from "./CategoryBannerGroup";
import { HeroBannerEditModal } from "./HeroBannerEditModal";
import type { EditSlot, BannerSaveResult } from "./types";

type FilterTab = "all" | "active" | "none";
type SortMode = "default" | "name-asc" | "name-desc";

interface HeroBannersOverviewProps {
  categories: CategoryItem[];
}

export function HeroBannersOverview({ categories }: HeroBannersOverviewProps) {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [editSlot, setEditSlot] = useState<EditSlot | null>(null);
  const [clock, setClock] = useState<string | null>(null);

  useEffect(() => {
    const update = () =>
      setClock(
        new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })
      );
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, []);

  const loadBanners = (showLoading = false) => {
    if (showLoading) setLoading(true);
    getAllHeroBannersForAdmin()
      .then(setBanners)
      .catch(() => setBanners([]))
      .finally(() => {
        if (showLoading) setLoading(false);
      });
  };

  useEffect(() => {
    loadBanners(true);
  }, []);

  const parentCategories = useMemo(() => categories.filter((c) => !c.parent), [categories]);

  const subcategoryCountOf = useMemo(() => {
    const counts = new Map<string, number>();
    categories.forEach((c) => {
      if (c.parent) counts.set(String(c.parent), (counts.get(String(c.parent)) ?? 0) + 1);
    });
    return counts;
  }, [categories]);

  const bannersByCategory = useMemo(() => {
    const map = new Map<string, CategoryBanners>();
    parentCategories.forEach((cat) => {
      const id = idOf(cat);
      const own = banners.filter((b) => (b.categoryId ?? "") === id);
      map.set(id, {
        hero: own.find((b) => b.placement === "hero") ?? null,
        side: own.filter((b) => b.placement === "side").slice(0, 2),
        bottom: own.filter((b) => b.placement === "bottom").slice(0, 2),
      });
    });
    return map;
  }, [banners, parentCategories]);

  const filteredCategories = useMemo(() => {
    return parentCategories.filter((cat) => {
      const id = idOf(cat);
      const matchesSearch = cat.name.toLowerCase().includes(search.trim().toLowerCase());
      if (!matchesSearch) return false;
      const hasHero = Boolean(bannersByCategory.get(id)?.hero);
      if (tab === "active") return hasHero;
      if (tab === "none") return !hasHero;
      return true;
    });
  }, [parentCategories, bannersByCategory, search, tab]);

  const sortedCategories = useMemo(() => {
    if (sortMode === "default") return filteredCategories;
    const sorted = [...filteredCategories].sort((a, b) => a.name.localeCompare(b.name));
    return sortMode === "name-desc" ? sorted.reverse() : sorted;
  }, [filteredCategories, sortMode]);

  const cycleSort = () =>
    setSortMode((current) =>
      current === "default" ? "name-asc" : current === "name-asc" ? "name-desc" : "default"
    );

  const liveCount = parentCategories.filter((cat) => bannersByCategory.get(idOf(cat))?.hero).length;
  const unconfiguredCount = parentCategories.length - liveCount;

  const handleToggleActive = async (banner: HeroBanner) => {
    setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, isActive: !b.isActive } : b)));
    try {
      await updateHeroBanner(banner.id, { isActive: !banner.isActive });
    } catch {
      // revert on failure
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, isActive: banner.isActive } : b)));
    }
  };

  const handleBannerSaved = (result?: BannerSaveResult) => {
    setEditSlot(null);
    if (!result) {
      loadBanners(false);
      return;
    }

    if (result.type === "create") {
      setBanners((prev) => [result.banner, ...prev.filter((b) => b.id !== result.banner.id)]);
    } else if (result.type === "update") {
      setBanners((prev) => prev.map((b) => (b.id === result.banner.id ? result.banner : b)));
    } else if (result.type === "delete") {
      setBanners((prev) => prev.filter((b) => b.id !== result.id));
    }

    // Silent background sync without showing full-page loader or collapsing accordions
    loadBanners(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb & system status */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-muted">
          <span>Administrator Hub</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-primary">Campaign Merchandising</span>
        </div>
        {clock && (
          <div className="flex items-center gap-1.5 rounded-full bg-muted-bg px-2.5 py-1 font-semibold uppercase tracking-wide text-muted">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <span>System time {clock} UTC · {process.env.NODE_ENV === "production" ? "Production" : "Development"}</span>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-text md:text-3xl">Hero Banners</h1>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">HQ Admin</span>
          </div>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Manage category-specific promotional campaigns, scheduling, and homepage display priority.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            title="Bulk campaign rules — coming soon"
            className="flex cursor-not-allowed items-center gap-1.5 rounded-lg bg-muted-bg px-4 py-2.5 text-sm font-semibold text-muted"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Batch Rules
          </button>
          <button
            type="button"
            onClick={() =>
              setEditSlot({ categoryId: "", categoryName: "Homepage Default", placement: "hero", banner: null })
            }
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Add Banner
          </button>
        </div>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard icon={<Layers className="h-5 w-5" />} label="Total Categories" value={String(parentCategories.length)} />
        <StatCard icon={<Sparkles className="h-5 w-5" />} label="Live Banners" value={`${liveCount} Active`} tone="primary" />
        <StatCard icon={<ImageIcon className="h-5 w-5" />} label="Unconfigured" value={`${unconfiguredCount} Categories`} />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col items-center justify-between gap-3 rounded-xl bg-surface p-3 shadow-sm md:flex-row">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full rounded-lg bg-background py-2 pl-9 pr-3 text-sm text-text placeholder:text-muted focus:outline-none"
          />
        </div>
        <div className="flex w-full items-center justify-between gap-2 md:w-auto md:justify-end">
          <div className="flex items-center gap-1 rounded-lg bg-background p-1">
            {(
              [
                ["all", `All (${parentCategories.length})`],
                ["active", `Active (${liveCount})`],
                ["none", `No Banner (${unconfiguredCount})`],
              ] as [FilterTab, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  tab === value ? "bg-surface text-text shadow-sm" : "text-muted hover:text-text"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={cycleSort}
            title={
              sortMode === "default"
                ? "Sort A–Z"
                : sortMode === "name-asc"
                ? "Sort Z–A"
                : "Reset to default order"
            }
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-background text-muted transition hover:text-text"
          >
            {sortMode === "name-desc" ? <ArrowUpZA className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Accordion list */}
      {loading ? (
        <div className="rounded-xl bg-surface p-8 text-center text-sm text-muted shadow-sm">Loading banners...</div>
      ) : sortedCategories.length === 0 ? (
        <div className="rounded-xl bg-surface p-8 text-center text-sm text-muted shadow-sm">No categories match your search.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedCategories.map((cat, index) => {
            const id = idOf(cat);
            return (
              <CategoryBannerGroup
                key={id}
                category={cat}
                categoryId={id}
                subcategoryCount={subcategoryCountOf.get(id) ?? 0}
                banners={bannersByCategory.get(id) ?? { hero: null, side: [], bottom: [] }}
                defaultOpen={index === 0}
                onEditSlot={setEditSlot}
                onToggleActive={handleToggleActive}
              />
            );
          })}
        </div>
      )}

      {/* Guidance footer */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-xl bg-muted-bg/40 p-4 text-xs text-muted sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 flex-shrink-0 text-primary" />
          <span>Banner changes go live across web and mobile shortly after publishing.</span>
        </div>
        <a href="#" className="flex-shrink-0 font-semibold text-primary hover:underline">
          Campaign Guidelines &amp; Asset Specs →
        </a>
      </div>

      {editSlot && (
        <HeroBannerEditModal
          slot={editSlot}
          onClose={() => setEditSlot(null)}
          onSaved={handleBannerSaved}
        />
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: "default" | "primary";
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface p-3 shadow-sm">
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone === "primary" ? "bg-primary/10 text-primary" : "bg-muted-bg text-muted"}`}>
        {icon}
      </span>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</div>
        <div className={`text-lg font-bold ${tone === "primary" ? "text-primary" : "text-text"}`}>{value}</div>
      </div>
    </div>
  );
}
