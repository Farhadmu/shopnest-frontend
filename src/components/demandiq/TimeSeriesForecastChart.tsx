"use client";

import { useState } from "react";
import { DemandForecastPoint, ProductDemandMetrics } from "@/lib/api/demandiq";
import { TrendingUp, AlertTriangle, Calendar, Layers, ShieldCheck } from "lucide-react";

interface Props {
  product: ProductDemandMetrics;
}

export function TimeSeriesForecastChart({ product }: Props) {
  const [hoveredPoint, setHoveredPoint] = useState<DemandForecastPoint | null>(null);
  const points = product.forecastPoints || [];

  if (points.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-border/60 text-xs text-muted-foreground">
        Insufficient sales history to render time-series forecast.
      </div>
    );
  }

  // Chart dimensions
  const width = 640;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;

  const maxVal = Math.max(
    ...points.map((p) => Math.max(p.upperBound || 0, p.historical || 0, p.forecasted || 0)),
    5
  );

  const getX = (index: number) => paddingX + (index / (points.length - 1)) * (width - paddingX * 2);
  const getY = (val: number) => height - paddingY - (val / maxVal) * (height - paddingY * 2);

  // Confidence interval area (upper and lower bounds)
  const confidenceAreaPoints = points
    .map((p, i) => `${getX(i)},${getY(p.upperBound)}`)
    .concat(
      points
        .slice()
        .reverse()
        .map((p, i) => `${getX(points.length - 1 - i)},${getY(p.lowerBound)}`)
    )
    .join(" ");

  // Historical path (points with historical value)
  const historicalPoints = points
    .map((p, i) => (p.historical !== undefined && i < 14 ? `${getX(i)},${getY(p.historical)}` : null))
    .filter(Boolean);
  const historicalPath = historicalPoints.length > 0 ? `M ${historicalPoints.join(" L ")}` : "";

  // Forecast path (from index 13 onwards)
  const forecastPathPoints = points.slice(13).map((p, i) => `${getX(i + 13)},${getY(p.forecasted)}`);
  const forecastPath = forecastPathPoints.length > 0 ? `M ${forecastPathPoints.join(" L ")}` : "";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/80 to-card/40 p-5 shadow-sm backdrop-blur-md">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-indigo-500">{product.sku}</span>
            <h4 className="font-semibold text-foreground text-sm tracking-tight">{product.title}</h4>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            14-Day Observed Sales History &rarr; 14-Day Holt-Winters Forecast with 95% Confidence Interval
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-1 font-medium text-indigo-500 border border-indigo-500/20">
            <TrendingUp className="h-3 w-3" />
            {product.dailyVelocity7d} units/day
          </div>
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold border ${
              product.stockoutRisk === "critical"
                ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                : product.stockoutRisk === "warning"
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            }`}
          >
            {product.stockoutRisk === "critical" ? (
              <AlertTriangle className="h-3 w-3" />
            ) : (
              <ShieldCheck className="h-3 w-3" />
            )}
            {product.daysOfSupply}d stock left
          </div>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative mt-4 w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[500px] select-none overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const val = maxVal * (1 - ratio);
            const y = paddingY + ratio * (height - paddingY * 2);
            return (
              <g key={i}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="currentColor" strokeOpacity={0.08} strokeDasharray="3 3" />
                <text x={paddingX - 8} y={y + 3} textAnchor="end" className="fill-muted-foreground text-[9px] font-mono">
                  {Math.round(val * 10) / 10}
                </text>
              </g>
            );
          })}

          {/* Vertical divider separating History and Forecast */}
          <line
            x1={getX(13)}
            y1={paddingY}
            x2={getX(13)}
            y2={height - paddingY}
            stroke="#6366f1"
            strokeOpacity={0.4}
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
          <text x={getX(13) - 6} y={paddingY - 6} textAnchor="end" className="fill-muted-foreground text-[9px] font-medium">
            HISTORICAL
          </text>
          <text x={getX(13) + 6} y={paddingY - 6} textAnchor="start" className="fill-indigo-500 text-[9px] font-bold">
            FORECAST &rarr;
          </text>

          {/* Shaded 95% Confidence Interval Band */}
          <polygon points={confidenceAreaPoints} fill="#6366f1" fillOpacity={0.08} />

          {/* Historical Solid Line */}
          {historicalPath && (
            <path d={historicalPath} fill="none" stroke="#94a3b8" strokeWidth={2.5} strokeLinecap="round" />
          )}

          {/* Forecasted Dotted / Glowing Line */}
          {forecastPath && (
            <path
              d={forecastPath}
              fill="none"
              stroke="#6366f1"
              strokeWidth={3}
              strokeDasharray="5 3"
              strokeLinecap="round"
            />
          )}

          {/* Data Points on Hover */}
          {points.map((p, i) => {
            const x = getX(i);
            const isFuture = i >= 13;
            const y = getY(isFuture ? p.forecasted : p.historical || p.forecasted);

            return (
              <g
                key={i}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={hoveredPoint?.date === p.date ? 6 : 3}
                  className={`transition-all duration-150 ${
                    isFuture
                      ? "fill-indigo-600 stroke-card stroke-2 group-hover:scale-125"
                      : "fill-slate-400 stroke-card stroke-2"
                  }`}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div className="pointer-events-none absolute bottom-4 right-4 rounded-xl border border-indigo-500/30 bg-card/95 p-3 shadow-xl backdrop-blur-md text-xs">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Calendar className="h-3.5 w-3.5 text-indigo-500" />
              {hoveredPoint.date}
            </div>
            <div className="mt-1 space-y-0.5 text-[11px]">
              {hoveredPoint.historical !== undefined && (
                <div className="text-muted-foreground">
                  Observed Sales: <span className="font-mono font-semibold text-foreground">{hoveredPoint.historical}</span> units
                </div>
              )}
              <div className="text-indigo-500 font-medium">
                Forecast: <span className="font-mono font-bold text-foreground">{hoveredPoint.forecasted}</span> units/day
              </div>
              <div className="text-[10px] text-muted-foreground/80">
                Range (95% CI): [{hoveredPoint.lowerBound} - {hoveredPoint.upperBound}]
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Metrics Breakdown */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-border/40 pt-4 text-xs">
        <div className="rounded-xl bg-card/60 border border-border/40 p-2.5">
          <p className="text-[10px] text-muted-foreground uppercase font-medium">Reorder Point</p>
          <p className="text-sm font-bold text-foreground mt-0.5">{product.reorderPoint} units</p>
          <p className="text-[10px] text-muted-foreground">Trigger when stock &le; {product.reorderPoint}</p>
        </div>
        <div className="rounded-xl bg-card/60 border border-border/40 p-2.5">
          <p className="text-[10px] text-muted-foreground uppercase font-medium">Recommended EOQ</p>
          <p className="text-sm font-bold text-indigo-500 mt-0.5">+{product.recommendedReorderQty} units</p>
          <p className="text-[10px] text-muted-foreground">30-day optimal reorder batch</p>
        </div>
        <div className="rounded-xl bg-card/60 border border-border/40 p-2.5">
          <p className="text-[10px] text-muted-foreground uppercase font-medium">Safety Stock Buffer</p>
          <p className="text-sm font-bold text-foreground mt-0.5">{product.safetyStock} units</p>
          <p className="text-[10px] text-muted-foreground">98.0% target service level</p>
        </div>
        <div className="rounded-xl bg-card/60 border border-border/40 p-2.5">
          <p className="text-[10px] text-muted-foreground uppercase font-medium">30-Day Revenue at Risk</p>
          <p className={`text-sm font-bold mt-0.5 ${product.revenueAtRisk > 0 ? "text-rose-500" : "text-emerald-500"}`}>
            ${product.revenueAtRisk.toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground">Lost revenue if out of stock</p>
        </div>
      </div>
    </div>
  );
}
