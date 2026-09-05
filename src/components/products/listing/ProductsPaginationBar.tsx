import React from "react";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { buildProductsHref, ProductsQueryState } from "@/lib/utils/product-query";

export interface ProductsPaginationBarProps {
  page: number;
  totalPages: number;
  total: number;
  storesCount?: number;
  query: ProductsQueryState;
}

function getPageList(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: (number | "...")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("...");
    result.push(p);
    prev = p;
  }
  return result;
}

export function ProductsPaginationBar({ page, totalPages, total, storesCount = 24, query }: ProductsPaginationBarProps) {
  const pages = getPageList(page, totalPages);

  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-surface p-4 shadow-sm sm:flex-row">
      <div className="text-xs text-muted">
        Showing <span className="font-bold text-text">{page}</span> of{" "}
        <span className="font-bold text-text">{totalPages}</span> pages &middot;{" "}
        <span className="font-bold text-text">{total}</span> verified products across {storesCount} stores
      </div>

      <div className="flex items-center gap-1.5">
        <Link
          href={buildProductsHref(query, { page: String(Math.max(1, page - 1)) })}
          aria-label="Previous page"
          aria-disabled={page <= 1}
          className={`grid h-9 w-9 place-items-center rounded-lg transition-colors ${
            page <= 1 ? "pointer-events-none bg-muted-bg text-muted/50" : "bg-muted-bg text-text hover:bg-border/60"
          }`}
        >
          <FiChevronLeft size={16} />
        </Link>

        {pages.map((p, idx) =>
          p === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-xs font-bold text-muted">
              ...
            </span>
          ) : (
            <Link
              key={p}
              href={buildProductsHref(query, { page: String(p) })}
              className={`grid h-9 w-9 place-items-center rounded-lg text-sm font-bold transition-colors ${
                p === page ? "bg-primary text-white shadow-sm" : "bg-muted-bg text-text hover:bg-border/60"
              }`}
            >
              {p}
            </Link>
          )
        )}

        <Link
          href={buildProductsHref(query, { page: String(Math.min(totalPages, page + 1)) })}
          aria-label="Next page"
          aria-disabled={page >= totalPages}
          className={`grid h-9 w-9 place-items-center rounded-lg transition-colors ${
            page >= totalPages ? "pointer-events-none bg-muted-bg text-muted/50" : "bg-muted-bg text-text hover:bg-border/60"
          }`}
        >
          <FiChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}