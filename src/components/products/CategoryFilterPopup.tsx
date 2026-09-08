"use client";

import { useEffect, useState } from "react";
import { getCategories } from "@/lib/api/categories";
import { buildCategoryTree, type CategoryNode } from "@/lib/utils/category-tree";
import { CategoryPickerView } from "./category-filter/CategoryPickerView";

export function CategoryFilterPopup({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (name: string) => void;
}) {
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

  return <CategoryPickerView tree={tree} selected={selected} onSelect={onSelect} />;
}