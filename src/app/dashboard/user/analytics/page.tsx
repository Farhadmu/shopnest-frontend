import type { Metadata } from "next";
import { protectedFetch } from "@/lib/core/server";
import {
  ComprehensiveSpendingAnalytics,
  BudgetTrackerData,
} from "@/lib/api/customer-intelligence";
import { SpendingAnalyticsClient } from "./SpendingAnalyticsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Spending Analytics | ShopNest",
  description: "Comprehensive insights into your spending patterns, trends, and budget tracking on ShopNest.",
  keywords: ["spending analytics", "budget tracker", "expense insights", "shopnest user dashboard"],
  openGraph: {
    title: "Spending Analytics | ShopNest",
    description: "Comprehensive insights into your spending patterns, trends, and budget tracking.",
  },
};

export default async function SpendingAnalyticsPage() {
  const [analyticsResult, budgetResult] = await Promise.allSettled([
    protectedFetch<ComprehensiveSpendingAnalytics>("/customer/spending/analytics", {
      cache: "no-store",
    }),
    protectedFetch<BudgetTrackerData>("/customer/spending/budget", {
      cache: "no-store",
    }),
  ]);

  const initialAnalytics =
    analyticsResult.status === "fulfilled" ? analyticsResult.value : null;
  const initialBudget =
    budgetResult.status === "fulfilled" ? budgetResult.value : null;

  return (
    <SpendingAnalyticsClient
      initialAnalytics={initialAnalytics}
      initialBudget={initialBudget}
    />
  );
}
