"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaChevronDown, FaChevronRight, FaLayerGroup } from "react-icons/fa";
import { getCategories } from "@/lib/api/categories";
import { buildCategoryTree, idOf, type CategoryNode } from "@/lib/utils/category-tree";
import { useOutsideClick } from "@/hooks/useOutsideClick";

/** One column of the flyout: a top-level category with its subcategories. */
function CategoryColumn({ node }: { node: CategoryNode }) {
  return (
    <div className="min-w-0">
      <Link
        href={`/products?category=${encodeURIComponent(node.name)}`}
        className="mb-2 block truncate text-sm font-black text-text hover:text-primary transition-colors"
      >
        {node.name}
      </Link>
      {node.children.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {node.children.map((child) => (
            <li key={idOf(child)} className="min-w-0">
              <Link
                href={`/products?category=${encodeURIComponent(child.name)}`}
                className="block truncate text-xs font-medium text-muted transition hover:text-primary"
              >
                {child.name}
              </Link>
              {/* Third level, if any — rendered as a nested indented list. */}
              {child.children.length > 0 && (
                <ul className="ml-3 mt-1 flex flex-col gap-1 border-l border-border pl-2">
                  {child.children.map((grandchild) => (
                    <li key={idOf(grandchild)} className="min-w-0">
                      <Link
                        href={`/products?category=${encodeURIComponent(grandchild.name)}`}
                        className="block truncate text-[11px] font-medium text-muted/80 transition hover:text-primary"
                      >
                        {grandchild.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Collapsible per-root accordion row, used inside the mobile nav menu. */
function MobileCategoryRow({ node, onNavigate }: { node: CategoryNode; onNavigate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children.length > 0;

  return (
    <div className="border-b border-border/60 last:border-b-0">
      <div className="flex items-center">
        <Link
          href={`/products?category=${encodeURIComponent(node.name)}`}
          onClick={onNavigate}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-text hover:bg-muted-bg"
        >
          {node.name}
        </Link>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse subcategories" : "Expand subcategories"}
            aria-expanded={expanded}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-muted-bg"
          >
            <FaChevronDown size={11} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <div className="mb-1 ml-3 flex flex-col gap-0.5 border-l border-border pl-2">
          {node.children.map((child) => (
            <Link
              key={idOf(child)}
              href={`/products?category=${encodeURIComponent(child.name)}`}
              onClick={onNavigate}
              className="rounded-lg px-3 py-2 text-xs font-medium text-muted hover:bg-muted-bg hover:text-text"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Mobile equivalent of `CategoryMegaMenu` — hover doesn't work well on
 * touch, so this renders the same nested tree as a tap-to-expand
 * accordion instead, meant to sit inside the mobile nav dropdown.
 */
export function MobileCategoryMenu({ onNavigate }: { onNavigate: () => void }) {
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
    <div className="mb-2 rounded-xl border border-border bg-surface p-1">
      {tree.map((root) => (
        <MobileCategoryRow key={idOf(root)} node={root} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

/**
 * Hover dropdown / mega menu for the navbar — builds a nested tree from the
 * flat category list (via `buildCategoryTree`) and renders it as columns of
 * root categories with their subcategories underneath.
 */
export function CategoryMegaMenu({ className = "" }: { className?: string }) {
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useOutsideClick(containerRef, () => setOpen(false));

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((cats) => {
        if (cancelled) return;
        setTree(buildCategoryTree(cats));
      })
      .catch(() => {
        if (!cancelled) setTree([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const scheduleHide = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  if (!loading && tree.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseEnter={show}
      onMouseLeave={scheduleHide}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold text-muted transition hover:bg-muted-bg hover:text-text"
      >
        <FaLayerGroup size={12} />
        Categories
        <FaChevronDown size={9} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-40 mt-2 w-max max-w-[min(90vw,56rem)] rounded-2xl border border-border bg-surface p-5 shadow-2xl shadow-black/10 backdrop-blur-xl animate-in fade-in zoom-in-95">
          <div
            className="grid gap-x-8 gap-y-5"
            style={{ gridTemplateColumns: `repeat(${Math.min(tree.length, 4)}, minmax(140px, 1fr))` }}
          >
            {tree.map((root) => (
              <CategoryColumn key={idOf(root)} node={root} />
            ))}
          </div>
          <div className="mt-4 border-t border-border pt-3">
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              Browse all products <FaChevronRight size={9} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
