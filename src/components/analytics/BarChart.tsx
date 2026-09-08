"use client";

import React, { useState } from "react";

interface BarDataPoint {
  label: string;
  value: number;
  color?: string;
  subLabel?: string;
}

interface BarChartProps {
  data: BarDataPoint[];
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  color?: string;
  barColor?: string;
}

export function BarChart({
  data,
  height = 200,
  valuePrefix = "",
  valueSuffix = "",
  color,
  barColor = "var(--primary, #0ea5e9)",
}: BarChartProps) {
  const activeBarColor = color || barColor;
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="flex h-40 items-center justify-center text-xs text-muted">No data available</div>;
  }

  const maxVal = Math.max(...data.map((d) => d.value), 10);

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-2 pt-6" style={{ height }}>
        {data.map((item, i) => {
          const heightPercent = Math.max(8, (item.value / maxVal) * 100);
          const isHovered = hoveredIdx === i;

          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="group relative flex flex-1 flex-col items-center justify-end h-full cursor-pointer"
            >
              {/* Hover Tooltip */}
              {isHovered && (
                <div className="absolute -top-7 z-10 whitespace-nowrap rounded-md bg-text px-2 py-1 text-[10px] font-bold text-surface shadow-md">
                  {valuePrefix}{item.value.toLocaleString()}{valueSuffix}
                </div>
              )}

              {/* Bar */}
              <div
                className="w-full max-w-[42px] rounded-t-lg transition-all duration-200 group-hover:brightness-110"
                style={{
                  height: `${heightPercent}%`,
                  backgroundColor: item.color || activeBarColor,
                  opacity: hoveredIdx !== null && !isHovered ? 0.4 : 1,
                }}
              />

              {/* Label */}
              <div className="mt-2 text-center">
                <p className="text-[10px] font-bold text-muted truncate max-w-[60px]">{item.label}</p>
                {item.subLabel && <p className="text-[9px] text-muted/80">{item.subLabel}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
