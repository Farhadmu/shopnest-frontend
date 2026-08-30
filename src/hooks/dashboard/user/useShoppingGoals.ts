"use client";

import { useEffect, useState } from "react";
import {
  getShoppingGoals,
  ShoppingGoalData,
  createShoppingGoal,
  updateShoppingGoal,
  deleteShoppingGoal,
} from "@/lib/api/customer-intelligence";

/** Loads + mutates the customer's personal shopping goals list. */
export function useShoppingGoals() {
  const [goals, setGoals] = useState<ShoppingGoalData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShoppingGoals()
      .then(setGoals)
      .catch(() => setGoals([]))
      .finally(() => setLoading(false));
  }, []);

  const createGoal = async (title: string, targetBudget: number) => {
    const created = await createShoppingGoal({
      title,
      category: "General Setup",
      targetBudget,
      items: [
        { title: "Primary Essential", estimatedPrice: Math.round(targetBudget * 0.7), isCompleted: false },
        { title: "Complementary Accessory", estimatedPrice: Math.round(targetBudget * 0.3), isCompleted: false },
      ],
    });
    setGoals((prev) => [created, ...prev]);
  };

  const toggleGoalItem = async (goalId: string, itemIdx: number) => {
    const target = goals.find((g) => g.id === goalId);
    if (!target) return;
    const updatedItems = target.items.map((it, idx) => (idx === itemIdx ? { ...it, isCompleted: !it.isCompleted } : it));
    const updated = await updateShoppingGoal(goalId, { items: updatedItems });
    setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
  };

  const removeGoal = async (goalId: string) => {
    await deleteShoppingGoal(goalId);
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  return { goals, loading, createGoal, toggleGoalItem, removeGoal };
}
