"use client";

import React, { useEffect, useState } from "react";
import { getCategories } from "@/lib/api/categories";
import { buildCategoryTree, idOf, type CategoryNode } from "@/lib/utils/category-tree";
import { CategoryColumn } from "./CategoryColumn";
import Link from "next/link";
import { FaChevronDown, FaChevronRight, FaLayerGroup } from "react-icons/fa";

export function CategoryMegaMenu({ className = "" }: { className?: string }) {
  const [tree, setTree] = useState<CategoryNode[]>([]);

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((cats) => {
        if (!cancelled) setTree(buildCategoryTree(cats));
      })
      .catch(() => {
        if (!cancelled) setTree([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (tree.length === 0) return null;

  return (
    <div className={`group relative inline-block ${className}`}>
      {/* Trigger — pure CSS hover via Tailwind group */}
      <Link
        href="/products"
        className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold text-muted transition hover:bg-muted-bg hover:text-text"
      >
        <FaLayerGroup size={12} />
        Categories
        <FaChevronDown
          size={9}
          className="transition-transform duration-200 group-hover:rotate-180"
        />
      </Link>

      {/* Flyout mega-menu — shown on CSS :hover, no JS needed */}
      <div className="invisible absolute left-0 top-full z-40 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <div className="w-max max-w-[min(90vw,56rem)] rounded-2xl border border-border bg-surface p-5 shadow-2xl shadow-black/10 backdrop-blur-xl">
          <div
            className="grid gap-x-8 gap-y-5"
            style={{
              gridTemplateColumns: `repeat(${Math.min(tree.length, 4)}, minmax(140px, 1fr))`,
            }}
          >
            {tree.map((root) => (
              <CategoryColumn key={idOf(root)} node={root} />
            ))}
          </div>

          <div className="mt-4 border-t border-border pt-3">
            <Link
              href="/products"
              className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              Browse all products <FaChevronRight size={9} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}