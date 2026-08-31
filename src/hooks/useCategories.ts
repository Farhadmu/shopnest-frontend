"use client";

import { useEffect, useState } from "react";
import { getCategories, Category } from "@/lib/api/categories";

/** Loads the real category list from the backend — single source of truth wherever a category picker is needed. */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
