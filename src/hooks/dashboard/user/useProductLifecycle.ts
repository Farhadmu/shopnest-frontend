"use client";

import { useEffect, useState } from "react";
import { getProductLifecycles, ProductLifecycleItem } from "@/lib/api/customer-intelligence";

/** Loads warranty / maintenance lifecycle tracking for purchased products. */
export function useProductLifecycle() {
  const [lifecycles, setLifecycles] = useState<ProductLifecycleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductLifecycles()
      .then(setLifecycles)
      .catch(() => setLifecycles([]))
      .finally(() => setLoading(false));
  }, []);

  return { lifecycles, loading };
}
