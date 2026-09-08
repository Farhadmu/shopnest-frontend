"use client";

import React, { useState } from "react";

interface DivisionItem {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  sellers: number;
  customers: number;
  growth: string;
}

interface BangladeshActivityMapProps {
  divisions: DivisionItem[];
}

export function BangladeshActivityMap({ divisions }: BangladeshActivityMapProps) {
  const [selectedMetric, setSelectedMetric] = useState<"orders" | "revenue" | "sellers" | "customers">("orders");
  const [activeDivision, setActiveDivision] = useState<DivisionItem | null>(divisions[0] || null);

  const maxVal = Math.max(...divisions.map((d) => d[selectedMetric]), 1);

  return (
    <div className="w-full">
      {/* Metric Toggle Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
          Bangladesh Regional Distribution
        </span>
        <div className="flex items-center gap-1 rounded-xl bg-muted-bg p-1 text-xs font-bold">
          {(["orders", "revenue", "sellers", "customers"] as const).map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setSelectedMetric(m)}
              className={`rounded-lg px-3 py-1.5 capitalize transition cursor-pointer ${
                selectedMetric === m ? "bg-surface text-primary shadow-sm" : "text-muted hover:text-text"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Division Bars Grid */}
        <div className="space-y-3">
          {divisions.map((div) => {
            const val = div[selectedMetric];
            const percent = Math.max(12, Math.round((val / maxVal) * 100));
            const isSelected = activeDivision?.id === div.id;

            return (
              <div
                key={div.id}
                onClick={() => setActiveDivision(div)}
                className={`group rounded-xl border p-3 transition cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-surface hover:border-primary/40 hover:bg-muted-bg/50"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📍</span>
                    <span className="text-text">{div.name}</span>
                    <span className="rounded-md bg-success/15 px-1.5 py-0.5 text-[10px] text-success">
                      {div.growth}
                    </span>
                  </div>
                  <span className="font-black text-text">
                    {selectedMetric === "revenue" ? `৳${(val / 1000000).toFixed(1)}M` : val.toLocaleString()}
                  </span>
                </div>

                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Division Deep Dive Card */}
        {activeDivision && (
          <div className="rounded-2xl border border-primary/30 bg-surface p-5 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Selected Hub</span>
                  <h3 className="text-xl font-black text-text">{activeDivision.name}</h3>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  {activeDivision.growth} YoY
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted-bg p-3.5">
                  <p className="text-[11px] font-semibold text-muted">Total Orders</p>
                  <p className="mt-1 text-lg font-black text-text">{activeDivision.orders.toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-muted-bg p-3.5">
                  <p className="text-[11px] font-semibold text-muted">GMV Revenue</p>
                  <p className="mt-1 text-lg font-black text-primary">৳{(activeDivision.revenue / 1000000).toFixed(2)}M</p>
                </div>
                <div className="rounded-xl bg-muted-bg p-3.5">
                  <p className="text-[11px] font-semibold text-muted">Active Merchants</p>
                  <p className="mt-1 text-lg font-black text-text">{activeDivision.sellers.toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-muted-bg p-3.5">
                  <p className="text-[11px] font-semibold text-muted">Registered Buyers</p>
                  <p className="mt-1 text-lg font-black text-text">{activeDivision.customers.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-border p-3 text-xs text-muted">
              🚚 Next-day delivery operational across all {activeDivision.name} central upazilas and courier hubs.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
