"use client";

import { useEffect, useState } from "react";
import { getProductLifecycles, addMaintenanceRecord, ProductLifecycleItem } from "@/lib/api/customer-intelligence";

interface LifecycleListResponse {
  items: ProductLifecycleItem[];
  total: number;
}

function unwrapLifecycleResponse(data: unknown): ProductLifecycleItem[] {
  if (data && typeof data === "object" && Array.isArray((data as LifecycleListResponse).items)) {
    return (data as LifecycleListResponse).items;
  }
  if (Array.isArray(data)) return data;
  return [];
}

export function useProductLifecycle() {
  const [lifecycles, setLifecycles] = useState<ProductLifecycleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setError(null);
      const data = await getProductLifecycles();
      setLifecycles(unwrapLifecycleResponse(data));
    } catch {
      setLifecycles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getProductLifecycles()
      .then((data) => { if (active) setLifecycles(unwrapLifecycleResponse(data)); })
      .catch(() => { if (active) setLifecycles([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const addMaintenance = async (lifecycleId: string, data: { title: string; dueDate: string; notes?: string; status?: string }) => {
    const updated = await addMaintenanceRecord(lifecycleId, data);
    setLifecycles((prev) => prev.map((lc) => (lc.id === lifecycleId ? updated : lc)));
    await refresh();
    return updated;
  };

  return { lifecycles, loading, error, refresh, addMaintenance };
}
