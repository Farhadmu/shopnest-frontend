"use client";

import { useState } from "react";
import { detectShoppingIntent, IntentDetectionResult } from "@/lib/api/ai-commerce";

/** Drives the "AI Natural Language Shopping Assistant" search box on the overview page. */
export function useShoppingIntent() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<IntentDetectionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const detect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await detectShoppingIntent(query);
      setResult(res);
    } catch {
      // handled — result stays null, form stays interactive
    } finally {
      setLoading(false);
    }
  };

  return { query, setQuery, result, loading, detect };
}
