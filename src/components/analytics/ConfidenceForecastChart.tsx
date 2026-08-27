"use client";

import React, { useState } from "react";

interface ForecastPoint {
  day: number;
  date: string;
  expectedRevenue: number;
  lowerBand: number;
  upperBand: number;
  expectedOrders: number;
}

interface ConfidenceForecastChartProps {
  data: ForecastPoint[];
  height?: number;
}

export function ConfidenceForecastChart({ data, height = 240 }: ConfidenceForecastChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="flex h-48 items-center justify-center text-xs text-muted">No forecast data</div>;
  }

  const allUppers = data.map((d) => d.upperBand);
  const allLowers = data.map((d) => d.lowerBand);
  const minVal = Math.min(...allLowers) * 0.9;
  const maxVal = Math.max(...allUppers) * 1.05;
  const range = maxVal - minVal || 1;

  const width = 600;
  const padX = 45;
  const padY = 25;
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;

  const getX = (i: number) => padX + (i / (data.length - 1 || 1)) * plotW;
  const getY = (val: number) => padY + plotH - ((val - minVal) / range) * plotH;

  // Upper & Lower Band paths for confidence cone
  const upperPoints = data.map((d, i) => `${getX(i)},${getY(d.upperBand)}`);
  const lowerPoints = data.slice().reverse().map((d, i) => `${getX(data.length - 1 - i)},${getY(d.lowerBand)}`);
  const confidenceBandPath = `M ${upperPoints.join(" L ")} L ${lowerPoints.join(" L ")} Z`;

  // Central Forecast line
  const forecastLinePoints = data.map((d, i) => `${getX(i)},${getY(d.expectedRevenue)}`).join(" ");

  return (
    <div className="relative w-full overflow-hidden">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3 text-[11px] font-semibold text-muted">
        <span>30-Day Forward Revenue Trajectory</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary/20 border border-primary/40" /> 88% Confidence Interval
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full bg-primary" /> Projected Value
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
        {/* Grid lines */}
        {[0, 0.33, 0.66, 1].map((pct, i) => {
          const y = padY + plotH * pct;
          const labelVal = Math.round(maxVal - pct * range);
          return (
            <g key={i}>
              <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
              <text x={padX - 8} y={y + 3} textAnchor="end" className="fill-muted text-[9px] font-medium">
                ৳{(labelVal / 1000).toFixed(0)}k
              </text>
            </g>
          );
        })}

        {/* Confidence Band Area */}
        <path d={confidenceBandPath} fill="var(--primary, #0ea5e9)" fillOpacity="0.15" />

        {/* Center Projected Line */}
        <polyline
          fill="none"
          stroke="var(--primary, #0ea5e9)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={forecastLinePoints}
        />

        {/* Interactive nodes */}
        {data.map((d, i) => {
          const x = getX(i);
          const y = getY(d.expectedRevenue);
          const isHovered = hoveredIdx === i;

          // Only draw label every 5 days for clarity
          const showLabel = i === 0 || i === 7 || i === 14 || i === 21 || i === 29;

          return (
            <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} className="cursor-pointer">
              {isHovered && (
                <line x1={x} y1={padY} x2={x} y2={height - padY} stroke="var(--primary, #0ea5e9)" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="2 2" />
              )}
              {isHovered && (
                <circle cx={x} cy={y} r={6} fill="var(--primary, #0ea5e9)" className="stroke-surface stroke-2" />
              )}
              {showLabel && (
                <text x={x} y={height - 6} textAnchor="middle" className="fill-muted text-[10px] font-bold">
                  Day {d.day}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredIdx !== null && data[hoveredIdx] && (
        <div
          className="pointer-events-none absolute top-2 rounded-xl border border-border bg-surface/95 p-3 shadow-xl backdrop-blur-sm"
          style={{ left: `${(hoveredIdx / (data.length - 1 || 1)) * 75 + 10}%` }}
        >
          <p className="text-[10px] font-bold text-muted">{data[hoveredIdx].date} (Day {data[hoveredIdx].day})</p>
          <p className="mt-0.5 text-xs font-black text-primary">
            Expected: ৳{data[hoveredIdx].expectedRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted">
            Range: ৳{data[hoveredIdx].lowerBand.toLocaleString()} — ৳{data[hoveredIdx].upperBand.toLocaleString()}
          </p>
          <p className="text-[10px] font-bold text-success mt-0.5">
            ~{data[hoveredIdx].expectedOrders} orders projected
          </p>
        </div>
      )}
    </div>
  );
}
