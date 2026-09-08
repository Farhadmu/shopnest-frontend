"use client";

import { useState } from "react";
import { detectShoppingIntent, IntentDetectionResult } from "@/lib/api/ai-commerce";

export const SUGGESTED_SHOPPING_PROMPTS = [
  "Gaming mouse under 3000 taka",
  "Wireless earbuds for gym under 4000 tk",
  "Best birthday gift for brother under 5000 tk",
  "Mechanical keyboard under 6000",
  "Smartwatch for sister under 3500 tk",
  "Leather wallet for father under 2000",
];

/** Drives the "AI Natural Language Shopping Assistant" on the customer overview page. */
export function useShoppingIntent() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<IntentDetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (customPrompt?: string) => {
    const textToSearch = (customPrompt || query).trim();
    if (!textToSearch) return;
    if (customPrompt) setQuery(customPrompt);

    setLoading(true);
    setError(null);
    try {
      const res = await detectShoppingIntent(textToSearch);
      setResult(res);
    } catch (err: any) {
      setError(err?.message || "Failed to search products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const detect = async (e: React.FormEvent) => {
    e.preventDefault();
    search();
  };

  const reset = () => {
    setQuery("");
    setResult(null);
    setError(null);
  };

  return { query, setQuery, result, loading, error, detect, search, reset, suggestions: SUGGESTED_SHOPPING_PROMPTS };
}

