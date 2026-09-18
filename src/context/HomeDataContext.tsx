"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getCategories, type Category } from "@/lib/api/categories";
import {
  getProducts,
  getTrendingProducts,
  type Product,
} from "@/lib/api/products";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HomeData {
  categories: Category[];
  trendingProducts: Product[];
  justForYouProducts: Product[];
  loadingProgress: number;
  isHomeReady: boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const HomeDataContext = createContext<HomeData>({
  categories: [],
  trendingProducts: [],
  justForYouProducts: [],
  loadingProgress: 0,
  isHomeReady: false,
});

export function useHomeData() {
  return useContext(HomeDataContext);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function HomeDataProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [justForYouProducts, setJustForYouProducts] = useState<Product[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isHomeReady, setIsHomeReady] = useState(false);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    function safeProgress(value: number) {
      if (mountedRef.current) setLoadingProgress(value);
    }

    async function fetchCriticalData() {
      const [categoriesResult, trendingResult, justForYouResult] =
        await Promise.allSettled([
          getCategories(),
          getTrendingProducts(8),
          getProducts({ page: 1, limit: 8, sort: "newest" }),
        ]);

      if (categoriesResult.status === "fulfilled" && mountedRef.current) {
        setCategories(categoriesResult.value);
      }

      if (trendingResult.status === "fulfilled" && mountedRef.current) {
        const res = trendingResult.value;
        const products = res && Array.isArray(res.products) ? res.products : [];
        setTrendingProducts(products);
      }

      if (justForYouResult.status === "fulfilled" && mountedRef.current) {
        const res = justForYouResult.value;
        let products: Product[] = [];
        if (Array.isArray(res)) {
          products = res as Product[];
        } else if (res && typeof res === "object") {
          const obj = res as Record<string, unknown>;
          if (Array.isArray(obj.items)) products = obj.items as Product[];
          else if (Array.isArray(obj.products)) products = obj.products as Product[];
          else if (Array.isArray(obj.data)) products = obj.data as Product[];
        }
        setJustForYouProducts(products);
      }

      if (mountedRef.current) {
        setLoadingProgress(100);
        setIsHomeReady(true);
      }
    }

    fetchCriticalData();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const value: HomeData = {
    categories,
    trendingProducts,
    justForYouProducts,
    loadingProgress,
    isHomeReady,
  };

  return (
    <HomeDataContext.Provider value={value}>
      {children}
    </HomeDataContext.Provider>
  );
}