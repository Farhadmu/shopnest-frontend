"use client";

import { useEffect, useState } from "react";
import {
  getShoppingGoals,
  createShoppingGoal,
  updateShoppingGoal,
  addGoalProgress,
  deleteShoppingGoal,
  ShoppingGoalData,
} from "@/lib/api/customer-intelligence";

interface GoalsListResponse {
  items: ShoppingGoalData[];
  total: number;
}

function unwrapGoalsResponse(data: unknown): ShoppingGoalData[] {
  if (data && typeof data === "object" && Array.isArray((data as GoalsListResponse).items)) {
    return (data as GoalsListResponse).items;
  }
  if (Array.isArray(data)) return data;
  return [];
}

export function useShoppingGoals() {
  const [goals, setGoals] = useState<ShoppingGoalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshGoals = async () => {
    try {
      setError(null);
      const data = await getShoppingGoals();
      setGoals(unwrapGoalsResponse(data));
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
        if (active) setGoals(unwrapGoalsResponse(data));
      })
      .catch(() => { if (active) setGoals([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const createGoal = async (title: string, targetBudget: number, category = "General", targetDate?: string) => {
    const cleanTitle = title.trim();
    if (!cleanTitle || Number(targetBudget) <= 0) return null;

    const created = await createShoppingGoal({
      title: cleanTitle,
      category,
      targetBudget: Number(targetBudget),
      targetDate,
      items: [],
    });

    setGoals((prev) => [created, ...prev]);
    await refreshGoals();
    return created;
  };

  const addProgress = async (goalId: string, amount: number) => {
    const updated = await addGoalProgress(goalId, amount);
    setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
    await refreshGoals();
    return updated;
  };

  const updateGoal = async (goalId: string, data: { title?: string; targetBudget?: number; targetDate?: string; category?: string; notes?: string; status?: "active" | "completed" | "cancelled" }) => {
    const updated = await updateShoppingGoal(goalId, data);
    setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
    await refreshGoals();
    return updated;
  };

  const removeGoal = async (goalId: string) => {
    await deleteShoppingGoal(goalId);
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    await refreshGoals();
  };

  return { goals, loading, error, refreshGoals, createGoal, addProgress, updateGoal, removeGoal };
}
