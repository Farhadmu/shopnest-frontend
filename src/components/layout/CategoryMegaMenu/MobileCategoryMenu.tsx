"use client";

import React, { useEffect, useState } from "react";
import { FaChevronDown, FaThLarge } from "react-icons/fa";
import { getCategories } from "@/lib/api/categories";
import { buildCategoryTree, idOf, type CategoryNode } from "@/lib/utils/category-tree";
import { MobileCategoryRow } from "./MobileCategoryRow";

interface MobileCategoryMenuProps {
  onClose?: () => void;
}

export function MobileCategoryMenu({ onClose }: MobileCategoryMenuProps = {}) {
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [isOpen, setIsOpen] = useState(false);

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
    <div className="mb-2 rounded-2xl border border-border/80 bg-surface/80 overflow-hidden shadow-2xs transition-all">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-3.5 py-3 text-sm font-bold text-text transition hover:bg-muted-bg cursor-pointer active:scale-[0.99]"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
            <FaThLarge size={12} />
          </span>
          <span>Browse Categories</span>
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-black text-primary">
            {tree.length}
          </span>
        </span>
        <FaChevronDown
          size={11}
          className={`text-muted transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="max-h-[280px] overflow-y-auto border-t border-border/60 p-1 space-y-0.5 scrollbar-thin">
          {tree.map((root) => (
            <MobileCategoryRow key={idOf(root)} node={root} onClose={onClose} />
          ))}
        </div>
      )}
    </div>
  );
}