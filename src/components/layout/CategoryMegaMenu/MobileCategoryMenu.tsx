"use client";

import React, { useEffect, useState } from "react";
import { getCategories } from "@/lib/api/categories";
import { buildCategoryTree, idOf, type CategoryNode } from "@/lib/utils/category-tree";
import { MobileCategoryRow } from "./MobileCategoryRow";

export function MobileCategoryMenu() {
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
        <MobileCategoryRow key={idOf(root)} node={root} />
      ))}
    </div>
  );
}