"use client";

import { useState } from "react";
import { generateBudgetPlan, BudgetPlanResult } from "@/lib/api/customer-intelligence";

/** Drives the Smart AI Budget Planner form + generated result. */
export function useBudgetPlanner() {
  const [budgetInput, setBudgetInput] = useState(50000);
  const [budgetPurpose, setBudgetPurpose] = useState("gaming");
  const [budgetPlan, setBudgetPlan] = useState<BudgetPlanResult | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await generateBudgetPlan(budgetInput, budgetPurpose);
      setBudgetPlan(res);
    } catch {
      // handled — budgetPlan stays as-is, form stays interactive
    } finally {
      setLoading(false);
    }
  };

  return { budgetInput, setBudgetInput, budgetPurpose, setBudgetPurpose, budgetPlan, loading, generate };
}
