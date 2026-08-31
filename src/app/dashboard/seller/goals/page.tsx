"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import { LoadingCard, ErrorState, EmptyState } from "@/components/dashboard/DashboardStates";
import { getSellerGoals, createSellerGoal, deleteSellerGoal, SellerGoalItem } from "@/lib/api/seller-intelligence";

export default function SellerGoalsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goals, setGoals] = useState<SellerGoalItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [metricType, setMetricType] = useState("revenue");
  const [targetValue, setTargetValue] = useState(100000);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSellerGoals();
      setGoals(data);
    } catch {
      setError("Failed to load goals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const created = await createSellerGoal({
        title,
        metricType,
        targetValue: Number(targetValue),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        unit: metricType === "revenue" ? "৳" : "units",
      });
      setGoals((prev) => [created, ...prev]);
      setTitle("");
      setShowForm(false);
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSellerGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch { /* ignore */ }
  };

  const activeGoals = goals.filter((g) => g.status === "in_progress").length;
  const achievedGoals = goals.filter((g) => g.status === "achieved").length;

  return (
    <DashboardShell role="Seller" title="Seller Goals" subtitle="Set and track your business targets" links={sellerDashboardLinks}>
      <div className="space-y-6">
        {error && <ErrorState message={error} onRetry={loadData} />}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon="🎯" value={String(activeGoals)} label="Active Goals" note="In progress" color="default" />
          <StatCard icon="✅" value={String(achievedGoals)} label="Achieved" note="Completed" color="success" />
          <StatCard icon="📊" value={String(goals.length)} label="Total Goals" note="All goals" color="accent" />
        </div>

        {/* Create Goal Button */}
        <div className="flex justify-end">
          <button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover transition">
            {showForm ? "Cancel" : "+ New Goal"}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <Panel title="Create New Goal">
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-muted">Goal Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Monthly Revenue Target" className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-muted">Metric</label>
                  <select value={metricType} onChange={(e) => setMetricType(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text">
                    <option value="revenue">Revenue</option>
                    <option value="orders">Orders</option>
                    <option value="products">Products Sold</option>
                    <option value="rating">Store Rating</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-muted">Target Value</label>
                  <input type="number" value={targetValue} onChange={(e) => setTargetValue(Number(e.target.value))} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none" />
                </div>
              </div>
              <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover">Create Goal</button>
            </form>
          </Panel>
        )}

        {/* Goals List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-muted-bg animate-pulse" />
            ))}
          </div>
        ) : goals.length === 0 ? (
          <EmptyState icon="🎯" title="No goals yet" description="Create your first business goal to start tracking progress." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {goals.map((goal) => {
              const progress = goal.targetValue > 0 ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) : 0;
              return (
                <div key={goal.id} className="rounded-2xl border border-border bg-surface p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-text">{goal.title}</h4>
                      <p className="text-xs text-muted capitalize">{goal.metricType} • {goal.unit}</p>
                    </div>
                    <button onClick={() => handleDelete(goal.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                  </div>
                  <div className="mb-2 flex items-end justify-between">
                    <span className="text-lg font-black text-primary">{goal.unit}{goal.currentValue.toLocaleString()}</span>
                    <span className="text-xs text-muted">of {goal.unit}{goal.targetValue.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted-bg overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${progress >= 100 ? "bg-emerald-500" : progress >= 50 ? "bg-blue-500" : "bg-amber-500"}`} style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-2 text-xs font-bold text-muted">{progress}% complete</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
