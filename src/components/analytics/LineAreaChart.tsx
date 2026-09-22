"use client";

import React, { useState, useId } from "react";

export interface DataPoint {
  label: string;
  shortLabel?: string;
  fullLabel?: string;
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
  showLegend?: boolean;
}

export function LineAreaChart({
  data,
  height = 195,
  valuePrefix = "",
  valueSuffix = "",
  color,
  primaryColor = "var(--primary, #0ea5e9)",
  secondaryColor = "#10b981",
  primaryLabel = "Current",
  secondaryLabel = "Target",
  showLegend = false,
}: LineAreaChartProps) {
  const activePrimaryColor = color || primaryColor;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const rawId = useId();
  const gradientId = `chartGradient-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  if (!data || data.length === 0) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted">
        No trajectory data available
      </div>
    );
  }

  const allValues = data.flatMap((d) => [d.value, d.secondaryValue].filter((v): v is number => v !== undefined));
  const minVal = Math.min(...allValues, 0);
  const maxVal = Math.max(...allValues, 10);
  const range = maxVal - minVal || 1;

  // ViewBox coordinate space (expanded to 760px for ample horizontal label clearance)
  const width = 760;
  const paddingLeft = 48;
  const paddingRight = 24;
  const paddingTop = 14;
  const paddingBottom = 26;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const getX = (index: number) => paddingLeft + (index / (data.length - 1 || 1)) * plotWidth;
  const getY = (val: number) => paddingTop + plotHeight - ((val - minVal) / range) * plotHeight;

  const pointsPrimary = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(" ");
  const areaPath = `M ${getX(0)},${height - paddingBottom} L ${pointsPrimary} L ${getX(data.length - 1)},${height - paddingBottom} Z`;

  const hasSecondary = data.some((d) => d.secondaryValue !== undefined);
  const pointsSecondary = hasSecondary
    ? data.map((d, i) => `${getX(i)},${getY(d.secondaryValue ?? d.value)}`).join(" ")
    : "";

  // Dynamic label stride: guarantees non-overlapping labels regardless of data points count
  const maxLabels = Math.max(Math.floor(plotWidth / 78), 4);
  const stride = data.length > maxLabels ? Math.ceil(data.length / maxLabels) : 1;

  const shouldShowLabel = (i: number) => {
    if (i === 0) return true;
    if (i === data.length - 1) return true;
    // Don't render penultimate label if it's too close to the last one
    if (i === data.length - 2 && data.length - 1 - i < stride) return false;
    return i % stride === 0;
  };

  const formatAxisLabel = (d: DataPoint) => {
    if (d.shortLabel) return d.shortLabel;
    // Replace verbose " (Proj)" with a clean asterisk indicator on the axis tick
    return d.label.replace(/\s*\(Proj\)/gi, "*");
  };

  const formatTooltipLabel = (d: DataPoint) => {
    if (d.fullLabel) return d.fullLabel;
    if (d.label.includes("(Proj)")) {
      return d.label.replace("(Proj)", "(Projected Forecast)");
    }
    return d.label;
  };

  return (
    <div className="relative w-full select-none">
      {showLegend && (
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
      )}

      <div className="w-full overflow-x-auto sm:overflow-visible">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[460px] sm:min-w-full overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={activePrimaryColor} stopOpacity="0.22" />
              <stop offset="100%" stopColor={activePrimaryColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-axis labels */}
          {[0, 0.33, 0.66, 1].map((pct, i) => {
            const y = paddingTop + plotHeight * pct;
            const labelVal = Math.round(maxVal - pct * range);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-muted text-[9px] font-mono font-medium"
                >
                  {valuePrefix}
                  {labelVal >= 1000000
                    ? `${(labelVal / 1000000).toFixed(1)}M`
                    : labelVal >= 1000
                    ? `${(labelVal / 1000).toFixed(0)}k`
                    : labelVal}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill={`url(#${gradientId})`} />

          {/* Secondary Line (Projected trajectory) */}
          {hasSecondary && (
            <polyline
              fill="none"
              stroke={secondaryColor}
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsSecondary}
            />
          )}

          {/* Primary Line (Recorded actuals) */}
          <polyline
            fill="none"
            stroke={activePrimaryColor}
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsPrimary}
          />

          {/* Interactive nodes & X-axis tick labels */}
          {data.map((d, i) => {
            const x = getX(i);
            const y = getY(d.value);
            const isHovered = hoveredIndex === i;
            const showLabel = shouldShowLabel(i);

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Vertical hover guide */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={height - paddingBottom}
                    stroke={activePrimaryColor}
                    strokeOpacity="0.45"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Data point circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 5.5 : 3.5}
                  fill={activePrimaryColor}
                  className="transition-all duration-150 stroke-surface stroke-2"
                />

                {/* Non-overlapping X-axis tick label */}
                {showLabel && (
                  <text
                    x={x}
                    y={height - 6}
                    textAnchor="middle"
                    className={`text-[9.5px] font-semibold transition-colors ${
                      isHovered ? "fill-text font-bold" : "fill-muted/80"
                    }`}
                  >
                    {formatAxisLabel(d)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div
          className="pointer-events-none absolute top-1 z-20 rounded-xl border border-white/10 bg-slate-900/95 px-3 py-2 text-slate-100 shadow-xl backdrop-blur-md transition-all duration-150"
          style={{
            left: `${Math.min(Math.max((hoveredIndex / (data.length - 1 || 1)) * 82 + 5, 10), 85)}%`,
          }}
        >
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {formatTooltipLabel(data[hoveredIndex])}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: activePrimaryColor }} />
            <span className="text-xs font-black text-white">
              {primaryLabel}: {valuePrefix}{data[hoveredIndex].value.toLocaleString()}{valueSuffix}
            </span>
          </div>
          {data[hoveredIndex].secondaryValue !== undefined && (
            <div className="mt-0.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: secondaryColor }} />
              <span className="text-[11px] font-bold text-emerald-400">
                {secondaryLabel}: {valuePrefix}{data[hoveredIndex].secondaryValue?.toLocaleString()}{valueSuffix}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
