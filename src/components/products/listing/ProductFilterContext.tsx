"use client";

import React, { createContext, useContext, useTransition, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface ProductFilterContextValue {
  isFiltering: boolean;
  pendingTarget: string | null;
  navigateWithFilter: (href: string, targetId?: string) => void;
}

const ProductFilterContext = createContext<ProductFilterContextValue>({
  isFiltering: false,
  pendingTarget: null,
  navigateWithFilter: () => {},
});

export function ProductFilterProvider({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition();
  const [pendingTarget, setPendingTarget] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    if (!isPending) {
      setPendingTarget(null);
    }
  }, [isPending, searchParams, pathname]);

  const navigateWithFilter = useCallback(
    (href: string, targetId?: string) => {
      if (targetId) setPendingTarget(targetId);
      startTransition(() => {
        router.push(href, { scroll: false });
      });
    },
    [router]
  );

  return (
    <ProductFilterContext.Provider
      value={{
        isFiltering: isPending,
        pendingTarget,
        navigateWithFilter,
      }}
    >
      {children}
    </ProductFilterContext.Provider>
  );
}

export function useProductFilter() {
  return useContext(ProductFilterContext);
}
