"use client";

import React, { useState } from "react";

export interface DonutSegment {
  label: string;
  value: number;
  color?: string;
  note?: string;
}

const DEFAULT_PALETTE = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#3b82f6", "#14b8a6"];

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  centerLabel?: string;
  centerValue?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  showLegend?: boolean;
}

export function DonutChart({
  data,
  size = 180,
  centerLabel = "Total",
  centerValue,
  valuePrefix = "",
  valueSuffix = "%",
  showLegend = true,
}: DonutChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const enrichedData = data.map((d, i) => ({
    ...d,
    color: d.color || DEFAULT_PALETTE[i % DEFAULT_PALETTE.length],
  }));

  const total = enrichedData.reduce((sum, d) => sum + d.value, 0) || 1;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-around">
      {/* SVG Ring */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeWidth={strokeWidth}
          />
          {enrichedData.map((seg, i) => {
            const percent = seg.value / total;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += percent;

            const isHovered = hoveredIdx === i;

            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer transition-all duration-200"
              />
            );
          })}
        </svg>

        {/* Center content */}
        <div className="absolute text-center pointer-events-none">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
            {hoveredIdx !== null ? enrichedData[hoveredIdx]?.label : centerLabel}
          </p>
          <p className="text-xl font-black text-text">
            {hoveredIdx !== null
              ? `${valuePrefix}${enrichedData[hoveredIdx]?.value.toLocaleString()}${valueSuffix}`
              : centerValue || `${valuePrefix}${total.toLocaleString()}${valueSuffix}`}
          </p>
        </div>
      </div>

      {/* Legend list */}
      {showLegend && (
        <div className="grid gap-2 text-xs">
          {enrichedData.map((seg, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between gap-4 rounded-lg px-2.5 py-1.5 transition cursor-pointer ${
                hoveredIdx === i ? "bg-muted-bg font-bold" : "text-muted"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
                <span className="font-semibold text-text">{seg.label}</span>
              </div>
              <span className="font-bold text-text">
                {valuePrefix}{seg.value.toLocaleString()}{valueSuffix}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
