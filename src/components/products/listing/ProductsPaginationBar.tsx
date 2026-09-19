"use client";

import React from "react";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight, FiLoader } from "react-icons/fi";
import { buildProductsHref, ProductsQueryState } from "@/lib/utils/product-query";
import { useProductFilter } from "./ProductFilterContext";

export interface ProductsPaginationBarProps {
  page: number;
  totalPages: number;
  total: number;
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

export function ProductsPaginationBar({ page, totalPages, total, query }: ProductsPaginationBarProps) {
  const pages = getPageList(page, totalPages);
  const { isFiltering, pendingTarget, navigateWithFilter } = useProductFilter();

  const handlePageClick = (e: React.MouseEvent, href: string, targetId: string) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
    navigateWithFilter(href, targetId);
  };

  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-surface p-4 shadow-sm sm:flex-row border border-border/60">
      <div className="text-xs text-muted flex items-center gap-2">
        {isFiltering ? (
          <span className="flex items-center gap-1.5 text-primary font-bold animate-pulse">
            <FiLoader className="animate-spin" size={13} />
            Loading page results...
          </span>
        ) : (
          <span>
            Showing <span className="font-bold text-text">{page}</span> of{" "}
            <span className="font-bold text-text">{totalPages}</span> pages &middot;{" "}
            <span className="font-bold text-text">{total}</span> verified products
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Link
          href={buildProductsHref(query, { page: String(Math.max(1, page - 1)) })}
          onClick={(e) =>
            handlePageClick(
              e,
              buildProductsHref(query, { page: String(Math.max(1, page - 1)) }),
              "page-prev"
            )
          }
          aria-label="Previous page"
          aria-disabled={page <= 1}
          className={`grid h-9 w-9 place-items-center rounded-lg transition-colors ${
            page <= 1
              ? "pointer-events-none bg-muted-bg text-muted/50"
              : "bg-muted-bg text-text hover:bg-border/60 cursor-pointer active:scale-95"
          }`}
        >
          {pendingTarget === "page-prev" ? (
            <FiLoader size={14} className="animate-spin text-primary" />
          ) : (
            <FiChevronLeft size={16} />
          )}
        </Link>

        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`ellipsis-${idx}`} className="px-1 text-xs font-bold text-muted">
                ...
              </span>
            );
          }
          const isPending = pendingTarget === `page-${p}`;
          const isCurrent = p === page;
          const href = buildProductsHref(query, { page: String(p) });

          return (
            <Link
              key={p}
              href={href}
              onClick={(e) => handlePageClick(e, href, `page-${p}`)}
              className={`grid h-9 w-9 place-items-center rounded-lg text-sm font-bold transition-all cursor-pointer active:scale-95 ${
                isCurrent
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted-bg text-text hover:bg-border/60"
              } ${isPending ? "ring-2 ring-primary/40 opacity-80" : ""}`}
            >
              {isPending ? <FiLoader size={13} className="animate-spin text-primary" /> : p}
            </Link>
          );
        })}

        <Link
          href={buildProductsHref(query, { page: String(Math.min(totalPages, page + 1)) })}
          onClick={(e) =>
            handlePageClick(
              e,
              buildProductsHref(query, { page: String(Math.min(totalPages, page + 1)) }),
              "page-next"
            )
          }
          aria-label="Next page"
          aria-disabled={page >= totalPages}
          className={`grid h-9 w-9 place-items-center rounded-lg transition-colors ${
            page >= totalPages
              ? "pointer-events-none bg-muted-bg text-muted/50"
              : "bg-muted-bg text-text hover:bg-border/60 cursor-pointer active:scale-95"
          }`}
        >
          {pendingTarget === "page-next" ? (
            <FiLoader size={14} className="animate-spin text-primary" />
          ) : (
            <FiChevronRight size={16} />
          )}
        </Link>
      </div>
    </div>
  );
}