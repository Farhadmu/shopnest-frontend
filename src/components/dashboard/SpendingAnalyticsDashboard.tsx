"use client";

import React, { useState, useEffect } from "react";
import { FiPieChart, FiTrendingUp } from "react-icons/fi";
import { getPersonalSpendingAnalytics, PersonalSpendingAnalyticsResponse } from "@/lib/api/customer-intelligence-features";
import { formatCurrency } from "@/lib/utils";

export function SpendingAnalyticsDashboard() {
  const [data, setData] = useState<PersonalSpendingAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPersonalSpendingAnalytics()
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted-bg rounded-2xl" />
          ))}
        </div>
        <div className="h-48 bg-muted-bg rounded-3xl" />
      </div>
    );
  }

  if (!data || data.totalOrders === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border text-muted">
        <FiPieChart className="mx-auto text-3xl mb-2 text-muted" />
        <p className="font-bold text-foreground">No spending data recorded yet.</p>
        <p className="text-xs mt-1">Your monthly analytics will automatically appear here once you place your first order.</p>
      </div>
    );
  }

  const maxMonthSpend = Math.max(...data.monthlySpending.map((m) => m.amount), 1);

  return (
    <div className="space-y-6">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border">
          <span className="text-[11px] font-bold text-muted uppercase block">Lifetime Spending</span>
          <span className="text-xl font-black text-foreground mt-1 block">{formatCurrency(data.totalSpent)}</span>
          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 mt-0.5">
            <FiTrendingUp /> Real-time order aggregation
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border">
          <span className="text-[11px] font-bold text-muted uppercase block">Orders Placed</span>
          <span className="text-xl font-black text-foreground mt-1 block">{data.totalOrders} Orders</span>
          <span className="text-[10px] text-muted mt-0.5 block">Across all verified merchants</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border">
          <span className="text-[11px] font-bold text-muted uppercase block">Average Order Value</span>
          <span className="text-xl font-black text-primary mt-1 block">{formatCurrency(data.averageOrderValue)}</span>
          <span className="text-[10px] text-muted mt-0.5 block">Avg basket size</span>
        </div>
      </div>

      {/* Monthly Spending Trend Bar Chart */}
      <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h4 className="text-sm font-extrabold text-foreground">Monthly Spending Trend</h4>
            <p className="text-[11px] text-muted">Purchase expense breakdown over time</p>
          </div>
          <span className="text-xs font-bold text-primary">{data.monthlySpending.length} Active Months</span>
        </div>

        <div className="h-40 flex items-end justify-between gap-3 pt-6 px-2">
          {data.monthlySpending.map((m, idx) => {
            const heightPct = Math.round((m.amount / maxMonthSpend) * 100);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 rounded-lg bg-popover text-popover-foreground text-[10px] font-bold shadow-md whitespace-nowrap pointer-events-none z-10">
                  {formatCurrency(m.amount)} ({m.count} orders)
                </div>
                <div
                  className="w-full max-w-[40px] rounded-t-xl bg-primary/80 hover:bg-primary transition-all duration-300 shadow-sm"
                  style={{ height: `${Math.max(15, heightPct)}%` }}
                />
                <span className="text-[11px] font-bold text-foreground">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Distribution Meters */}
      <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
        <h4 className="text-sm font-extrabold text-foreground border-b border-border/60 pb-3">
          Category Spending Distribution
        </h4>

        <div className="space-y-3">
          {data.categorySpending.map((cat, idx) => (
            <div key={idx} className="space-y-1 text-xs">
              <div className="flex justify-between font-bold text-foreground">
                <span>{cat.category}</span>
                <span>{formatCurrency(cat.amount)} ({cat.percentage}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted-bg overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
