"use client";

import { useState } from "react";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { userDashboardLinks } from "@/lib/constants/dashboard-nav";
import { useShoppingGoals } from "@/hooks/dashboard/user/useShoppingGoals";
import { useCategories } from "@/hooks/useCategories";
import { FaBullseye, FaCalendarAlt, FaCheckCircle, FaSpinner, FaPlus, FaEdit, FaTimes, FaMoneyBillWave } from "react-icons/fa";

export default function ShoppingGoalsPage() {
  const { goals, loading, error, refreshGoals, createGoal, addProgress, updateGoal, removeGoal } = useShoppingGoals();
  const { categories, loading: categoriesLoading } = useCategories();

  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState(25000);
  const [category, setCategory] = useState("general");
  const [targetDate, setTargetDate] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [progressGoalId, setProgressGoalId] = useState<string | null>(null);
  const [progressAmount, setProgressAmount] = useState("");

  const [editGoal, setEditGoal] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBudget, setEditBudget] = useState(0);

  const totalTarget = goals.reduce((s, g) => s + g.targetBudget, 0);
  const totalProgress = goals.reduce((s, g) => s + g.currentAmount, 0);
  const activeGoals = goals.filter((g) => g.status === "active").length;
  const completedGoals = goals.filter((g) => g.status === "completed").length;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || Number(budget) <= 0) return;
    await createGoal(title.trim(), Number(budget), category, targetDate || undefined);
    setTitle("");
    setBudget(25000);
    setCategory("general");
    setTargetDate("");
    setShowForm(false);
  };

  const handleAddProgress = async (goalId: string) => {
    const amount = Number(progressAmount);
    if (!amount || amount <= 0) return;
    await addProgress(goalId, amount);
    setProgressGoalId(null);
    setProgressAmount("");
  };

  const handleEdit = async (goalId: string) => {
    if (!editTitle.trim() || Number(editBudget) <= 0) return;
    await updateGoal(goalId, { title: editTitle.trim(), targetBudget: Number(editBudget) });
    setEditGoal(null);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: "bg-primary/15 text-primary",
      completed: "bg-success/15 text-success",
      cancelled: "bg-error/15 text-error",
    };
    return map[status] || "bg-muted-bg text-muted";
  };

  const formatDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <DashboardShell role="Customer" title="Shopping Goals" subtitle="Set targets and track progress toward your next big purchase." links={userDashboardLinks}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-2xl border border-error/30 bg-error/5 p-4 text-center text-sm text-error">
            {error}
            <button onClick={refreshGoals} className="ml-3 underline text-xs">Retry</button>
          </div>
        )}

        {/* Summary */}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          {[
            { label: "Total Goals", value: goals.length, icon: <FaBullseye /> },
            { label: "Active", value: activeGoals, icon: <FaSpinner /> },
            { label: "Completed", value: completedGoals, icon: <FaCheckCircle /> },
            { label: "Total Progress", value: `৳${totalProgress.toLocaleString()}`, icon: <FaMoneyBillWave /> },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-muted mb-2">{stat.icon} {stat.label}</div>
              <div className="text-2xl font-black text-text">{stat.value}</div>
              {stat.label === "Total Progress" && (
                <div className="text-[10px] text-muted mt-1">of ৳{totalTarget.toLocaleString()} target</div>
              )}
            </div>
          ))}
        </div>

        <Panel title="🎯 Shopping Goals">
          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mb-4 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-hover cursor-pointer"
            >
              <FaPlus size={12} /> Create New Goal
            </button>
          ) : (
            <form onSubmit={handleCreate} className="mb-6 rounded-2xl border border-border bg-muted-bg/30 p-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Goal name (e.g. Gaming Laptop)"
                  className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                  autoFocus
                />
                <input
                  type="number"
                  min={1}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  placeholder="Target Amount (৳)"
                  className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                >
                  <option value="general">General</option>
                  {categoriesLoading && (
                    <option value="" disabled>
                      Loading...
                    </option>
                  )}
                  {!categoriesLoading && categories.length === 0 && (
                    <option value="" disabled>
                      No categories found
                    </option>
                  )}
                  {!categoriesLoading &&
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                </select>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-primary-hover cursor-pointer">
                  Create Goal
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-text transition hover:bg-muted-bg cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted-bg/20 p-8 text-center text-sm text-muted">
              Loading your goals...
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
                      <span className="text-[10px] font-extrabold uppercase text-muted">{g.category}</span>
                      <h4 className="text-base font-black text-text">{g.title}</h4>
                      <p className="text-xs text-muted">Target: ৳{g.targetBudget.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${getStatusBadge(g.status)}`}>{g.status}</span>
                      <button type="button" onClick={() => removeGoal(g.id)} className="text-muted hover:text-error text-xs p-1 cursor-pointer" title="Delete goal">✕</button>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold">
                      <span className="text-muted">Progress</span>
                      <span className="text-primary">{g.progressPercentage}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                      <div className="h-full rounded-full bg-linear-to-r from-primary to-success transition-all duration-500" style={{ width: `${Math.min(100, g.progressPercentage)}%` }} />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-muted">
                      <span>৳{g.currentAmount.toLocaleString()} saved</span>
                      <span>৳{g.remainingAmount.toLocaleString()} remaining</span>
                    </div>
                  </div>

                  {g.targetDate && (
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <FaCalendarAlt size={12} /> Target: {formatDate(g.targetDate)}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                    {progressGoalId !== g.id ? (
                      <button
                        type="button"
                        onClick={() => setProgressGoalId(g.id)}
                        className="flex items-center gap-1 rounded-lg border border-border bg-muted-bg px-3 py-1.5 text-[11px] font-bold text-text transition hover:border-primary hover:text-primary cursor-pointer"
                      >
                        <FaPlus size={10} /> Add Progress
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={progressAmount}
                          onChange={(e) => setProgressAmount(e.target.value)}
                          placeholder="৳ Amount"
                          className="w-28 rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-text focus:border-primary focus:outline-none"
                          autoFocus
                        />
                        <button type="button" onClick={() => handleAddProgress(g.id)} className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-bold text-white cursor-pointer">Save</button>
                        <button type="button" onClick={() => { setProgressGoalId(null); setProgressAmount(""); }} className="rounded-lg border border-border bg-surface px-2 py-1.5 text-[11px] font-bold text-text cursor-pointer"><FaTimes size={10} /></button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => { setEditGoal(g.id); setEditTitle(g.title); setEditBudget(g.targetBudget); }}
                      className="flex items-center gap-1 rounded-lg border border-border bg-muted-bg px-3 py-1.5 text-[11px] font-bold text-text transition hover:border-primary hover:text-primary cursor-pointer"
                    >
                      <FaEdit size={10} /> Edit
                    </button>
                  </div>

                  {editGoal === g.id && (
                    <div className="space-y-2 rounded-xl border border-border bg-muted-bg/40 p-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text focus:border-primary focus:outline-none"
                      />
                      <input
                        type="number"
                        min={1}
                        value={editBudget}
                        onChange={(e) => setEditBudget(Number(e.target.value))}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text focus:border-primary focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleEdit(g.id)} className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-bold text-white cursor-pointer">Save</button>
                        <button type="button" onClick={() => setEditGoal(null)} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[11px] font-bold text-text cursor-pointer">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </DashboardShell>
  );
}