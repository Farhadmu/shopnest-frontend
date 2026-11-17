"use client";

import React, { useState } from "react";
import {
  Flame,
  Info,
  Calendar,
  Sparkles,
} from "lucide-react";

export interface HeatmapCell {
  day: string;
  intensity: number; // 0 - 100
  level: string;
  orderVolume?: number;
}

export interface HeatmapRow {
  category: string;
  days: HeatmapCell[];
}

export interface DemandHeatmapGridProps {
  data: HeatmapRow[];
  days: string[];
}

export function DemandHeatmapGrid({ data, days }: DemandHeatmapGridProps) {
  // Default active cell to first peak cell or first cell available
  const [activeCell, setActiveCell] = useState<{ category: string; cell: HeatmapCell } | null>(() => {
    if (!data || data.length === 0) return null;
    for (const row of data) {
      const peak = row.days.find((c) => c.intensity >= 85);
      if (peak) return { category: row.category, cell: peak };
    }
    return { category: data[0].category, cell: data[0].days[0] };
  });

  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 text-xs text-muted-foreground p-4 text-center">
        <Calendar className="h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="font-semibold text-foreground">No category demand points recorded</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Order volume across catalog categories will populate this matrix automatically.
        </p>
      </div>
    );
  }

  // Visual styling function based on demand saturation percentage
  const getCellStyles = (intensity: number, isSelected: boolean) => {
    let base = "";
    if (intensity >= 85) {
      // Peak Saturation
      base = "bg-gradient-to-br from-rose-500 to-pink-600 text-white font-black shadow-sm ring-1 ring-rose-400/40 hover:brightness-110";
    } else if (intensity >= 65) {
      // High Demand
      base = "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 font-bold hover:bg-amber-500/30";
    } else if (intensity >= 40) {
      // Moderate Demand
      base = "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold hover:bg-emerald-500/25";
    } else if (intensity > 0) {
      // Low Demand
      base = "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-semibold hover:bg-sky-500/20";
    } else {
      // Dormant / Zero Orders
      base = "bg-muted/20 text-muted-foreground/40 border border-border/30 hover:bg-muted/40";
    }

    if (isSelected) {
      base += " ring-2 ring-primary scale-105 z-10 shadow-md";
    }

    return base;
  };

  // Actionable strategic advice based on cell intensity
  const getCellStrategy = (intensity: number, category: string, day: string) => {
    if (intensity >= 85) {
      return {
        badge: "🔥 Peak Saturation Window",
        color: "text-rose-500",
        advice: `আপনার ${category} ক্যাটাগরিতে ${day} বারে তুঙ্গে থাকে বিক্রয় (পিক ডিমান্ড)। এই দিন শুরু হওয়ার ৬ ঘণ্টা আগে ফেসবুক/গুগল ক্যাম্পেইন চালু করুন এবং প্যাকেজিং আগে থেকেই রেডি রাখুন।`,
      };
    } else if (intensity >= 65) {
      return {
        badge: "⚡ High Demand Window",
        color: "text-amber-500",
        advice: `${day} বারে ${category} ক্যাটাগরিতে প্রচুর অর্ডার আসে। পর্যাপ্ত ইনভেন্টরি স্টক ও দ্রুত ডেলিভারি রেডি রাখুন।`,
      };
    } else if (intensity >= 40) {
      return {
        badge: "🎯 Moderate Demand Window",
        color: "text-emerald-500",
        advice: `স্বাভাবিক বিক্রির দিন। এই সময়ে ক্রস-সেল (Cross-sell) ও বান্ডেল ডিসকাউন্ট দিলে অর্ডার ভ্যালু (AOV) বাড়ানো সম্ভব।`,
      };
    } else if (intensity > 0) {
      return {
        badge: "💡 Light Shopping Window",
        color: "text-sky-500",
        advice: `অপেক্ষাকৃত ধীরগতির সেলস। এই সময়ে বড় বাজেটের বিজ্ঞাপন বন্ধ রেখে অর্গানিক পোস্ট ও রি-এনগেজমেন্টে ফোকাস করুন।`,
      };
    } else {
      return {
        badge: "💤 Dormant Window",
        color: "text-muted-foreground",
        advice: `এই বারে এখনো কোনো অর্ডার রেকর্ড হয়নি। নতুন অফার বা ফ্রি ডেলিভারি কুপন দিয়ে ক্রেতাদের আকৃষ্ট করার চেষ্টা করতে পারেন।`,
      };
    }
  };

  const activeStrategy = activeCell
    ? getCellStrategy(activeCell.cell.intensity, activeCell.category, activeCell.cell.day)
    : null;

  return (
    <div className="space-y-4">
      {/* Interactive Active Cell Inspector Banner */}
      {activeCell && activeStrategy && (
        <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-card/95 via-card/85 to-card/60 p-4 shadow-sm backdrop-blur-md transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-foreground text-sm">
                    {activeCell.category} &bull; {activeCell.cell.day}
                  </h4>
                  <span className={`text-[10px] font-extrabold ${activeStrategy.color}`}>
                    {activeStrategy.badge}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Demand Saturation:{" "}
                  <span className="font-mono font-black text-foreground">
                    {activeCell.cell.intensity}%
                  </span>
                  {activeCell.cell.orderVolume !== undefined && (
                    <span className="ml-2 font-mono text-muted-foreground">
                      (~{activeCell.cell.orderVolume} recorded units)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-xl bg-muted/50 border border-border/60 px-3 py-1 text-[11px] font-mono font-bold text-muted-foreground">
                {activeCell.cell.day} Intensity: {activeCell.cell.intensity}%
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 text-xs text-foreground/90 leading-relaxed">
            <span className="text-primary font-bold shrink-0 mt-0.5">💡 সেলারের করণীয়:</span>
            <span>{activeStrategy.advice}</span>
          </div>
        </div>
      )}

      {/* Heatmap Grid Table with Sticky Left Category Column */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/70 p-3 sm:p-5 shadow-sm backdrop-blur-md">
        <div className="w-full overflow-x-auto scrollbar-thin">
          <div className="min-w-[620px]">
            {/* Table Header: Days of the Week */}
            <div className="grid grid-cols-[180px_repeat(7,1fr)] gap-2 pb-2.5 text-center text-xs font-bold text-muted-foreground border-b border-border/50">
              <div className="sticky left-0 bg-card/95 backdrop-blur-md z-10 text-left pl-3 text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>Category Name</span>
              </div>
              {days.map((d) => {
                const isWeekend = d === "Fri" || d === "Sat";
                return (
                  <div
                    key={d}
                    className={`py-1 rounded-lg ${
                      isWeekend ? "bg-amber-500/10 text-amber-500 font-extrabold" : "text-muted-foreground"
                    }`}
                  >
                    <span>{d}</span>
                    {isWeekend && <span className="block text-[9px] font-normal">Surge</span>}
                  </div>
                );
              })}
            </div>

            {/* Matrix Rows */}
            <div className="divide-y divide-border/30 pt-1">
              {data.map((row) => {
                // Calculate category total intensity & peak day for badge
                const maxDay = row.days.reduce(
                  (max, c) => (c.intensity > max.intensity ? c : max),
                  row.days[0]
                );

                return (
                  <div
                    key={row.category}
                    className="grid grid-cols-[180px_repeat(7,1fr)] gap-2 items-center py-2 hover:bg-muted/20 rounded-xl transition-colors group"
                  >
                    {/* Sticky Category Column */}
                    <div className="sticky left-0 bg-card/95 backdrop-blur-md z-10 pl-3 pr-2 py-1 border-r border-border/40">
                      <p className="truncate text-xs font-bold text-foreground" title={row.category}>
                        {row.category}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                        <span>Peak: {maxDay.day}</span>
                        {maxDay.intensity >= 85 && (
                          <span className="text-rose-500 font-bold flex items-center">
                            <Flame className="h-2.5 w-2.5 ml-0.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Day Cells */}
                    {row.days.map((c, i) => {
                      const isSelected =
                        activeCell?.category === row.category && activeCell?.cell.day === c.day;

                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setActiveCell({ category: row.category, cell: c })}
                          onMouseEnter={() => setActiveCell({ category: row.category, cell: c })}
                          className={`flex h-11 flex-col items-center justify-center rounded-xl text-xs font-mono transition-all duration-150 cursor-pointer ${getCellStyles(
                            c.intensity,
                            isSelected
                          )}`}
                        >
                          <span className="font-extrabold leading-none">
                            {c.intensity > 0 ? `${c.intensity}%` : "—"}
                          </span>
                          {c.intensity >= 85 ? (
                            <span className="text-[8px] uppercase tracking-wider font-sans opacity-90 mt-0.5 font-bold">
                              Peak
                            </span>
                          ) : c.intensity >= 65 ? (
                            <span className="text-[8px] uppercase tracking-wider font-sans opacity-80 mt-0.5">
                              High
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend & Navigation Helper */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/40 border border-border/40 p-3 text-xs">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-primary" />
            <span>Click or hover any cell to reveal full seller demand telemetry & tactical playbook.</span>
          </span>

          {/* Color Scale Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-sm bg-muted/40 border border-border/40" /> 0% (Dormant)
            </span>
            <span className="flex items-center gap-1.5 text-sky-500">
              <span className="h-2.5 w-2.5 rounded-sm bg-sky-500/20 border border-sky-500/40" /> 1-39% (Low)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-500">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/20 border border-emerald-500/40" /> 40-64% (Moderate)
            </span>
            <span className="flex items-center gap-1.5 text-amber-500">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-500/20 border border-amber-500/40" /> 65-84% (High)
            </span>
            <span className="flex items-center gap-1.5 text-rose-500">
              <span className="h-2.5 w-2.5 rounded-sm bg-rose-500 text-white" /> 85%+ (Peak 🔥)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
