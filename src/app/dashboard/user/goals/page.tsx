"use client";

import { useState } from "react";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { userDashboardLinks } from "@/lib/constants/dashboard-nav";
import { useShoppingGoals } from "@/hooks/dashboard/user/useShoppingGoals";

export default function ShoppingGoalsPage() {
  const { goals, createGoal, toggleGoalItem, removeGoal, loading } = useShoppingGoals();
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState(25000);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || Number(budget) <= 0) return;
    await createGoal(title, Number(budget)).catch(() => {});
    setTitle("");
    setBudget(25000);
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
                min={1}
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

          {loading ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted-bg/20 p-8 text-center text-sm text-muted">
              Loading your shopping goals...
            </div>
          ) : goals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted-bg/20 p-8 text-center text-sm text-muted">
              No shopping goals yet. Create your first goal to track a big purchase.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {goals.map((g) => (
                <div key={g.id} className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold uppercase text-primary">{g.category}</span>
                      <h4 className="text-base font-black text-text">{g.title}</h4>
                      <p className="text-xs text-muted">Budget: ৳{g.targetBudget.toLocaleString()}</p>
                    </div>
                    <button type="button" onClick={() => removeGoal(g.id)} className="text-muted hover:text-error text-xs p-1 cursor-pointer" title="Remove goal">
                      ✕
                    </button>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold">
                      <span className="text-muted">Goal Progress</span>
                      <span className="text-primary">{g.progressPercentage}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-success transition-all duration-500" style={{ width: `${g.progressPercentage}%` }} />
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-border pt-2">
                    {g.items.map((it, iIdx) => (
                      <div key={`${g.id}-${iIdx}`} onClick={() => toggleGoalItem(g.id, iIdx)} className="flex cursor-pointer items-center justify-between rounded-lg p-2 text-xs transition hover:bg-muted-bg">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className={it.isCompleted ? "text-success font-black" : "text-muted"}>{it.isCompleted ? "✓" : "○"}</span>
                          <span className={it.isCompleted ? "line-through text-muted" : "font-semibold text-text"}>{it.title}</span>
                        </div>
                        <span className="shrink-0 font-bold text-muted">৳{it.estimatedPrice.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </DashboardShell>
  );
}
