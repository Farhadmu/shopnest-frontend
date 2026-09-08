"use client";

import { useMemo, useState } from "react";
import type { Store } from "@/types/store";
import StoresHero from "./StoresHero";
import StoreGrid from "./StoreGrid";
import TrustStandard from "./TrustStandard";
import SellerCTA from "./SellerCTA";

type StoresContentProps = {
  stores: Store[];
  categories: string[];
};

export default function StoresContent({
  stores,
  categories,
}: StoresContentProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Stores");
  const [sortOption, setSortOption] = useState("Highest Rated");

  // Filter + Search + Sort logic
  const filteredStores = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const result = stores.filter((store) => {
      const matchesCategory =
        selectedCategory === "All Stores" ||
        store.filterCategory === selectedCategory;

      const matchesSearch =
        search === "" ||
        store.name.toLowerCase().includes(search) ||
        store.category.toLowerCase().includes(search) ||
        store.desc.toLowerCase().includes(search) ||
        store.products.some((product) =>
          product.name.toLowerCase().includes(search)
        );

      return matchesCategory && matchesSearch;
    });

    return [...result].sort((a, b) => {
      if (sortOption === "Highest Rated") {
        return Number(b.rating) - Number(a.rating);
      }
      if (sortOption === "Most Popular") {
        return b.salesNumber - a.salesNumber;
      }
      if (sortOption === "Newest") {
        return stores.indexOf(b) - stores.indexOf(a);
      }
      return 0;
    });
  }, [stores, searchTerm, selectedCategory, sortOption]);


  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All Stores");
    setSortOption("Highest Rated");
  };

  return (
    <main className="bg-slate-50 dark:bg-slate-950">
      {/* 1. Hero Section (Banner) */}
      <StoresHero
        stores={stores}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearSearch={() => setSearchTerm("")}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* 2. Store Grid Section */}
   
      
      <StoreGrid
        stores={filteredStores}
        sortOption={sortOption}
        onSortChange={setSortOption} 
        totalStoresCount={filteredStores.length}
      />

      {/* 3. Other Sections */}
      <TrustStandard />
      <SellerCTA />
    </main>
  );
}