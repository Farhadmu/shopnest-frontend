"use client";

import { FiGrid, FiList, FiSearch, FiX } from "react-icons/fi";

export type StatusFilter = "all" | "active" | "inactive" | "low_stock";
export type SortOption = "newest" | "price_asc" | "price_desc" | "stock_asc" | "stock_desc" | "name_asc";

interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  statusCounts: { all: number; active: number; inactive: number; low_stock: number };
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (value: "table" | "grid") => void;
}

export function ProductFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  statusCounts,
  categoryFilter,
  onCategoryChange,
  categories,
  sortBy,
  onSortChange,
  itemsPerPage,
  onItemsPerPageChange,
  viewMode,
  onViewModeChange,
}: ProductFiltersProps) {
  const tabs: Array<{ key: StatusFilter; label: string }> = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
    { key: "low_stock", label: "Low Stock" },
  ];

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-surface p-3.5 shadow-xs">
      <div className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full min-w-0 flex-1 lg:min-w-[240px]">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted" />
          <input
            type="text"
            placeholder="Search product title, SKU, brand, category, ID..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-8 text-xs text-text placeholder-muted transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted hover:text-text"
              aria-label="Clear search"
            >
              <FiX size={13} />
            </button>
          )}
        </div>

        <div className="flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-xl border border-border/60 bg-muted-bg/50 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onStatusChange(tab.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === tab.key
                  ? "border border-border bg-surface font-bold text-primary shadow-xs"
                  : "text-muted hover:bg-surface/50 hover:text-text"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${statusFilter === tab.key ? "bg-primary/10 font-bold text-primary" : "bg-muted/15 text-muted"}`}>
                {statusCounts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-stretch justify-between gap-3 border-t border-border/60 pt-2 text-xs sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="flex items-center justify-between gap-1.5 sm:justify-start">
            <span className="font-medium text-muted">Category:</span>
            <select
              value={categoryFilter}
              onChange={(event) => onCategoryChange(event.target.value)}
              className="min-w-0 flex-1 cursor-pointer rounded-xl border border-border bg-background px-2.5 py-1 text-xs text-text focus:border-primary focus:outline-none sm:flex-none"
            >
              <option value="all">All Categories ({statusCounts.all})</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>

          <label className="flex items-center justify-between gap-1.5 sm:justify-start">
            <span className="font-medium text-muted">Sort:</span>
            <select
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value as SortOption)}
              className="min-w-0 flex-1 cursor-pointer rounded-xl border border-border bg-background px-2.5 py-1 text-xs text-text focus:border-primary focus:outline-none sm:flex-none"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="stock_asc">Stock: Low to High</option>
              <option value="stock_desc">Stock: High to Low</option>
              <option value="name_asc">Title A-Z</option>
            </select>
          </label>
        </div>

        <div className="flex items-center justify-between gap-2.5 sm:justify-start">
          <label className="flex items-center gap-1">
            <span className="font-medium text-muted">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(event) => onItemsPerPageChange(Number(event.target.value))}
              className="cursor-pointer rounded-lg border border-border bg-background px-2 py-0.5 text-xs text-text focus:border-primary focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>

          <div className="flex items-center rounded-lg border border-border bg-background p-0.5">
            <button type="button" onClick={() => onViewModeChange("table")} className={`rounded-md p-1.5 transition cursor-pointer ${viewMode === "table" ? "bg-surface text-primary shadow-xs" : "text-muted hover:text-text"}`} title="Table View">
              <FiList size={13} />
            </button>
            <button type="button" onClick={() => onViewModeChange("grid")} className={`rounded-md p-1.5 transition cursor-pointer ${viewMode === "grid" ? "bg-surface text-primary shadow-xs" : "text-muted hover:text-text"}`} title="Card Grid View">
              <FiGrid size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
