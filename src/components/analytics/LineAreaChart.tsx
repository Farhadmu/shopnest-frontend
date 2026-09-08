"use client";

import React, { useState } from "react";

interface DataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface LineAreaChartProps {
  data: DataPoint[];
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  color?: string;
  primaryColor?: string;
  secondaryColor?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
}

export function LineAreaChart({
  data,
  height = 220,
  valuePrefix = "",
  valueSuffix = "",
  color,
  primaryColor = "var(--primary, #0ea5e9)",
  secondaryColor = "#10b981",
  primaryLabel = "Current",
  secondaryLabel = "Target",
}: LineAreaChartProps) {
  const activePrimaryColor = color || primaryColor;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="flex h-48 items-center justify-center text-xs text-muted">No data available</div>;
  }

  const allValues = data.flatMap((d) => [d.value, d.secondaryValue].filter((v): v is number => v !== undefined));
  const minVal = Math.min(...allValues, 0);
  const maxVal = Math.max(...allValues, 10);
  const range = maxVal - minVal || 1;

  const width = 600;
  const paddingX = 40;
  const paddingY = 25;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  const getX = (index: number) => paddingX + (index / (data.length - 1 || 1)) * plotWidth;
  const getY = (val: number) => paddingY + plotHeight - ((val - minVal) / range) * plotHeight;

  const pointsPrimary = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(" ");
  const areaPath = `M ${getX(0)},${height - paddingY} L ${pointsPrimary} L ${getX(data.length - 1)},${height - paddingY} Z`;

  const hasSecondary = data.some((d) => d.secondaryValue !== undefined);
  const pointsSecondary = hasSecondary
    ? data.map((d, i) => `${getX(i)},${getY(d.secondaryValue ?? d.value)}`).join(" ")
    : "";

  return (
    <div className="relative w-full overflow-hidden">
      <div className="mb-2 flex items-center justify-end gap-4 text-[11px] font-semibold text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: activePrimaryColor }} />
          {primaryLabel}
        </span>
        {hasSecondary && (
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: secondaryColor }} />
            {secondaryLabel}
          </span>
        )}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={activePrimaryColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={activePrimaryColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.33, 0.66, 1].map((pct, i) => {
          const y = paddingY + plotHeight * pct;
          const labelVal = Math.round(maxVal - pct * range);
          return (
            <g key={i}>
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
              <text x={paddingX - 8} y={y + 3} textAnchor="end" className="fill-muted text-[9px] font-medium">
                {valuePrefix}{labelVal >= 1000 ? `${(labelVal / 1000).toFixed(0)}k` : labelVal}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#chartGradient)" />

        {/* Secondary Line */}
        {hasSecondary && (
          <polyline
            fill="none"
            stroke={secondaryColor}
            strokeWidth="2"
            strokeDasharray="4 4"
            points={pointsSecondary}
          />
        )}

        {/* Primary Line */}
        <polyline
          fill="none"
          stroke={activePrimaryColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pointsPrimary}
        />

        {/* Interactive nodes */}
        {data.map((d, i) => {
          const x = getX(i);
          const y = getY(d.value);
          const isHovered = hoveredIndex === i;

          return (
            <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer">
              {isHovered && (
                <line x1={x} y1={paddingY} x2={x} y2={height - paddingY} stroke={activePrimaryColor} strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="2 2" />
              )}
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 6 : 3.5}
                fill={activePrimaryColor}
                className="transition-all duration-150 stroke-surface stroke-2"
              />
              <text x={x} y={height - 6} textAnchor="middle" className="fill-muted text-[10px] font-semibold">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div
          className="pointer-events-none absolute top-2 rounded-lg border border-border bg-surface/95 px-3 py-1.5 shadow-lg backdrop-blur-sm"
          style={{ left: `${(hoveredIndex / (data.length - 1 || 1)) * 80 + 10}%` }}
        >
          <p className="text-[10px] font-bold text-muted">{data[hoveredIndex].label}</p>
          <p className="text-xs font-black text-text">
            {primaryLabel}: {valuePrefix}{data[hoveredIndex].value.toLocaleString()}{valueSuffix}
          </p>
          {data[hoveredIndex].secondaryValue !== undefined && (
            <p className="text-[11px] font-bold text-success">
              {secondaryLabel}: {valuePrefix}{data[hoveredIndex].secondaryValue?.toLocaleString()}{valueSuffix}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
