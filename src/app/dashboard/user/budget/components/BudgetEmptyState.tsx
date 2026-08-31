"use client";

import Link from "next/link";
import { AlertTriangle, ShoppingBag, ArrowRight } from "lucide-react";

interface BudgetEmptyStateProps {
  summary: string;
  category: string;
}

export function BudgetEmptyState({ summary, category }: BudgetEmptyStateProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border-2 p-6 sm:p-8 text-center shadow-sm"
      style={{
        borderColor: "color-mix(in srgb, var(--color-warning) 30%, transparent)",
        backgroundColor: "color-mix(in srgb, var(--color-warning) 5%, transparent)",
      }}
    >
      {/* Animated Warning Icon */}
      <div
        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shopnest-float"
        style={{
          backgroundColor: "color-mix(in srgb, var(--color-warning) 15%, transparent)",
          color: "var(--color-warning)",
          boxShadow: "0 0 0 8px color-mix(in srgb, var(--color-warning) 8%, transparent)",
        }}
      >
        <AlertTriangle className="h-7 w-7" />
      </div>

      {/* Main Alert Message Box */}
      <div
        className="mx-auto max-w-lg rounded-xl border p-4 shadow-sm"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "color-mix(in srgb, var(--color-warning) 25%, transparent)",
        }}
      >
        <span
          className="inline-block rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider mb-2"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-warning) 15%, transparent)",
            color: "var(--color-warning)",
          }}
        >
          Insufficient Budget / No Match
        </span>
        <p className="text-sm sm:text-base font-extrabold leading-snug" style={{ color: "var(--color-text)" }}>
          {summary}
        </p>
      </div>

      {/* Helper Text */}
      <p className="mt-3 text-xs font-semibold" style={{ color: "var(--color-muted)" }}>
        Try increasing your total budget or explore other available products in this category.
      </p>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={`/shop?category=${category}`}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition hover:opacity-90 shadow-md"
          style={{ backgroundColor: "var(--color-warning)" }}
        >
          <ShoppingBag className="h-4 w-4" />
          Explore {category} Items
        </Link>

        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition hover:border-primary"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            color: "var(--color-text)",
          }}
        >
          View All Products
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}