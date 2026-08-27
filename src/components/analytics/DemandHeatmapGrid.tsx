"use client";

import React, { useState } from "react";

interface HeatmapCell {
  day: string;
  intensity: number; // 0 - 100
  level: string;
  orderVolume?: number;
}

interface HeatmapRow {
  category: string;
  days: HeatmapCell[];
}

interface DemandHeatmapGridProps {
  data: HeatmapRow[];
  days: string[];
}

export function DemandHeatmapGrid({ data, days }: DemandHeatmapGridProps) {
  const [activeCell, setActiveCell] = useState<{ category: string; cell: HeatmapCell } | null>(null);

  const getColor = (intensity: number) => {
    if (intensity >= 85) return "bg-rose-500 text-white"; // Peak
    if (intensity >= 65) return "bg-amber-500 text-white"; // High
    if (intensity >= 45) return "bg-emerald-500 text-white"; // Medium
    return "bg-emerald-200 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-100"; // Low
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[500px]">
        {/* Days Header */}
        <div className="grid grid-cols-[140px_repeat(7,1fr)] gap-1.5 pb-2 text-center text-[11px] font-bold text-muted">
          <div className="text-left pl-2">Category</div>
          {days.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Heatmap Matrix */}
        <div className="grid gap-1.5">
          {data.map((row) => (
            <div key={row.category} className="grid grid-cols-[140px_repeat(7,1fr)] gap-1.5 items-center">
              <div className="truncate text-xs font-bold text-text pl-2" title={row.category}>
                {row.category}
              </div>
              {row.days.map((c, i) => (
                <button
                  type="button"
                  key={i}
                  onMouseEnter={() => setActiveCell({ category: row.category, cell: c })}
                  onMouseLeave={() => setActiveCell(null)}
                  className={`flex h-10 items-center justify-center rounded-lg text-xs font-extrabold transition hover:scale-105 hover:shadow-md cursor-pointer ${getColor(
                    c.intensity
                  )}`}
                >
                  {c.intensity}%
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Dynamic Tooltip Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted-bg p-3 text-xs">
          {activeCell ? (
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-text">{activeCell.category}</span>
              <span className="text-muted">• {activeCell.cell.day}</span>
              <span className="rounded-md bg-primary/20 px-2 py-0.5 font-bold text-primary">
                {activeCell.cell.intensity}% Demand Intensity
              </span>
              {activeCell.cell.orderVolume && (
                <span className="font-semibold text-text">~{activeCell.cell.orderVolume} est. orders</span>
              )}
            </div>
          ) : (
            <span className="text-muted">Hover over any cell to inspect category demand saturation.</span>
          )}

          {/* Color Scale Legend */}
          <div className="flex items-center gap-2 text-[10px] font-semibold text-muted">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-emerald-200 dark:bg-emerald-900" /> Low
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-emerald-500" /> Moderate
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-amber-500" /> High
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-rose-500" /> Peak
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
