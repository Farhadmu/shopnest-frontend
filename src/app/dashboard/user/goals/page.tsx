"use client";

import { useState } from "react";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { userDashboardLinks } from "@/lib/constants/dashboard-nav";
import { useShoppingGoals } from "@/hooks/dashboard/user/useShoppingGoals";

export default function ShoppingGoalsPage() {
  const { goals, createGoal, toggleGoalItem, removeGoal } = useShoppingGoals();
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState(25000);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createGoal(title, budget).catch(() => {});
    setTitle("");
  };

  return (
    <DashboardShell role="Customer" title="Shopping Goals" subtitle="Set targets and track milestones toward your next big purchase." links={userDashboardLinks}>
      <div className="space-y-6">
        <Panel title="🎯 Personal Shopping Goals">
          <form onSubmit={handleCreate} className="mb-6 rounded-2xl border border-border bg-muted-bg/30 p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Build Home Audio Setup"
                className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
              />
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                placeholder="Target Budget"
                className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
              />
              <button type="submit" className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-primary-hover cursor-pointer">
                + Add Shopping Goal
              </button>
            </div>
          </form>

          <div className="grid gap-4 sm:grid-cols-2">
            {goals.map((g) => (
              <div key={g.id} className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-primary">{g.category}</span>
                    <h4 className="text-base font-black text-text">{g.title}</h4>
                    <p className="text-xs text-muted">Budget: ৳{g.targetBudget.toLocaleString()}</p>
                  </div>
                  <button type="button" onClick={() => removeGoal(g.id)} className="text-muted hover:text-error text-xs p-1 cursor-pointer" title="Remove goal">
                    ✕
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-muted">Goal Progress</span>
                    <span className="text-primary">{g.progressPercentage}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-success transition-all duration-500" style={{ width: `${g.progressPercentage}%` }} />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  {g.items.map((it, iIdx) => (
                    <div key={iIdx} onClick={() => toggleGoalItem(g.id, iIdx)} className="flex items-center justify-between text-xs rounded-lg p-2 hover:bg-muted-bg transition cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className={it.isCompleted ? "text-success font-black" : "text-muted"}>{it.isCompleted ? "✓" : "○"}</span>
                        <span className={it.isCompleted ? "line-through text-muted" : "font-semibold text-text"}>{it.title}</span>
                      </div>
                      <span className="font-bold text-muted">৳{it.estimatedPrice.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
