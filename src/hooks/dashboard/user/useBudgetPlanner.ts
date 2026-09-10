"use client";

import { useState } from "react";
import { generateBudgetPlan, BudgetPlanResult } from "@/lib/api/customer-intelligence";
import { getErrorMessage } from "@/lib/core/errors";

/** Drives the Smart AI Budget Planner form + generated result. */
export function useBudgetPlanner() {
  const [budgetInput, setBudgetInput] = useState(50000);
  const [budgetPurpose, setBudgetPurpose] = useState("");
  const [budgetPlan, setBudgetPlan] = useState<BudgetPlanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateBudgetPlan(budgetInput, budgetPurpose);
      setBudgetPlan(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return { budgetInput, setBudgetInput, budgetPurpose, setBudgetPurpose, budgetPlan, loading, generate, error };
}
