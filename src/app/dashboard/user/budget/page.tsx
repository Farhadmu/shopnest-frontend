"use client";

import { useEffect } from "react";
import Link from "next/link";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { userDashboardLinks } from "@/lib/constants/dashboard-nav";
import { useBudgetPlanner } from "@/hooks/dashboard/user/useBudgetPlanner";
import { useCategories } from "@/hooks/useCategories";
import { BudgetEmptyState } from "./components/BudgetEmptyState";
import Image from "next/image";

export default function BudgetPlannerPage() {
  const { budgetInput, setBudgetInput, budgetPurpose, setBudgetPurpose, budgetPlan, loading, generate } = useBudgetPlanner();
  const { categories, loading: categoriesLoading } = useCategories();

  // Default to the first category slug once loaded
  useEffect(() => {
    if (!budgetPurpose && categories.length > 0) {
      setBudgetPurpose(categories[0].slug);
    }
  }, [categories, budgetPurpose, setBudgetPurpose]);

  return (
    <DashboardShell role="Customer" title="Smart Budget Planner" subtitle="Let AI allocate the optimal cart combination for your budget." links={userDashboardLinks}>
      <div className="space-y-6">
        <Panel title="💰 Smart AI Budget Planner">
          <div className="rounded-2xl border border-border bg-muted-bg/30 p-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-text mb-1">Total Shopping Budget (BDT)</label>
                <input
                  type="number"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text font-bold focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text mb-1">Category</label>
                <select
                  value={budgetPurpose}
                  onChange={(e) => setBudgetPurpose(e.target.value)}
                  disabled={categoriesLoading || categories.length === 0}
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text font-bold focus:border-primary focus:outline-none disabled:opacity-50"
                >
                  {categoriesLoading && <option>Loading categories...</option>}
                  {!categoriesLoading && categories.length === 0 && <option>No categories found</option>}
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={generate}
                  disabled={loading || !budgetPurpose}
                  className="w-full rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-primary-hover disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Optimizing Plan..." : "⚡ Generate Optimized Blueprint"}
                </button>
              </div>
            </div>
          </div>

          {budgetPlan && (
            <div className="mt-6 space-y-4">
              {budgetPlan.items.length === 0 ? (
                <BudgetEmptyState 
                  summary={budgetPlan.planSummary} 
                  category={budgetPlan.purpose} 
                />
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-primary/10 border border-primary/30 p-4">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Budget Optimization</span>
                      <p className="text-xs font-bold text-text mt-0.5">{budgetPlan.planSummary}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-muted">Allocated Spend</p>
                        <p className="text-base font-black text-text">৳{budgetPlan.totalPlannedSpend.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted">Remaining Buffer</p>
                        <p className="text-base font-black text-success">৳{budgetPlan.remainingBudget.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {budgetPlan.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 transition hover:border-primary/50"
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Step Badge */}
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted-bg text-base font-black text-primary">
                            {idx + 1}
                          </div>

                          {/* Product Image Preview */}
                          {item.selectedProduct?.image ? (
                            <Image
                              src={item.selectedProduct.image}
                              alt={item.selectedProduct.title}
                              width={100}
                              height={100}
                              className="h-14 w-14 shrink-0 rounded-xl border border-border object-cover bg-muted-bg"
                            />
                          ) : (
                            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-border bg-muted-bg text-[10px] font-bold text-muted">
                              No Image
                            </div>
                          )}

                          {/* Product Details */}
                          <div>
                            <span className="text-[10px] font-extrabold uppercase text-primary tracking-wider">
                              {item.role}
                            </span>
                            <h4 className="text-xs font-bold text-text line-clamp-1">
                              {item.selectedProduct?.title || "Curated Match"}
                            </h4>
                            <p className="text-[11px] font-semibold text-muted mt-0.5">
                              Allocated: <span className="text-text font-extrabold">৳{item.allocatedBudget.toLocaleString()}</span>
                            </p>
                          </div>
                        </div>

                        {/* Action Link */}
                        {item.selectedProduct && (
                          <Link
                            href={`/products/${item.selectedProduct.id}`}
                            className="shrink-0 rounded-xl border border-border bg-muted-bg px-3.5 py-2 text-xs font-bold text-text transition hover:border-primary hover:bg-surface text-center"
                          >
                            View Details →
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </Panel>
      </div>
    </DashboardShell>
  );
}