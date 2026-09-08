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

  const refreshGoals = async () => {
    try {
      const data = await getShoppingGoals();
      setGoals(data);
    } catch {
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    getShoppingGoals()
      .then((data) => {
        if (active) setGoals(data);
      })
      .catch(() => {
        if (active) setGoals([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const createGoal = async (title: string, targetBudget: number) => {
    const cleanTitle = title.trim();
    if (!cleanTitle || Number(targetBudget) <= 0) return;

    const created = await createShoppingGoal({
      title: cleanTitle,
      category: "General Setup",
      targetBudget: Number(targetBudget),
      items: [
        { title: "Primary Essential", estimatedPrice: Math.round(Number(targetBudget) * 0.7), isCompleted: false },
        { title: "Complementary Accessory", estimatedPrice: Math.round(Number(targetBudget) * 0.3), isCompleted: false },
      ],
    });

    setGoals((prev) => [created, ...prev]);
    await refreshGoals();
  };

  const toggleGoalItem = async (goalId: string, itemIdx: number) => {
    const target = goals.find((g) => g.id === goalId);
    if (!target) return;

    const updatedItems = target.items.map((it, idx) =>
      idx === itemIdx ? { ...it, isCompleted: !it.isCompleted } : it
    );

    const updated = await updateShoppingGoal(goalId, { items: updatedItems });
    setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
    await refreshGoals();
  };

  const removeGoal = async (goalId: string) => {
    await deleteShoppingGoal(goalId);
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    await refreshGoals();
  };

  return { goals, loading, createGoal, toggleGoalItem, removeGoal };
}
