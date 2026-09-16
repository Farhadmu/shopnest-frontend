"use client";

import { useState, useEffect } from "react";
import { getCategories, Category } from "@/lib/api/categories";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((cats) => {
        if (!cancelled) {
          // Filter for parent categories only (no parent)
          const parentCategories = cats.filter((cat) => !cat.parent);
          setCategories(parentCategories);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load categories.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading, error };
}