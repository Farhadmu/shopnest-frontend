"use client";

import { useEffect, useState } from "react";
import { getShoppingJourney, ShoppingJourneyData } from "@/lib/api/customer-intelligence";

/** Loads the personalized shopping journey (stage, progress, recommended items). */
export function useShoppingJourney() {
  const [journeyData, setJourneyData] = useState<ShoppingJourneyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShoppingJourney()
      .then(setJourneyData)
      .catch(() => setJourneyData(null))
      .finally(() => setLoading(false));
  }, []);

  return { journeyData, loading };
}
