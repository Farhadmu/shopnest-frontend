"use client";

import { useState, useMemo } from "react";
import { DemandForecastPoint, ProductDemandMetrics } from "@/lib/api/demandiq";
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { InfoTooltip } from "./InfoTooltip";

interface Props {
  product: ProductDemandMetrics;
}

export function TimeSeriesForecastChart({ product }: Props) {
  const points = useMemo(() => product.forecastPoints || [], [product.forecastPoints]);

  // Active or hovered point: default to the junction point (day 14) or first future point
  const defaultPoint = useMemo(() => {
    if (points.length >= 14) return points[13];
    return points[points.length - 1] || null;
  }, [points]);

  const [activePoint, setActivePoint] = useState<DemandForecastPoint | null>(defaultPoint);

  if (points.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border/60 text-xs text-muted-foreground p-4 text-center">
        Insufficient sales history to render time-series forecast. At least 7 days of order history is recommended.
      </div>
    );
  }

  // Chart dimensions — expanded height for grand, legible view
  const width = 680;
  const height = 280;
  const paddingX = 48;
  const paddingY = 36;

  // Calculate intelligent Y-axis domain
  const values = points.flatMap((p) => [
    p.historical ?? p.forecasted,
    p.forecasted,
    p.lowerBound ?? p.forecasted,
    p.upperBound ?? p.forecasted,
  ]);

  const rawMax = Math.max(...values, 0.1);

  // Dynamic domainMax so small decimal velocities (e.g. 0.2 u/d) don't get squashed at the bottom!
  let domainMax: number;
  if (rawMax <= 0.25) {
    domainMax = 0.4;
  } else if (rawMax <= 0.5) {
    domainMax = 0.8;
  } else if (rawMax <= 1.0) {
    domainMax = 1.25;
  } else if (rawMax <= 2.5) {
    domainMax = 3.0;
  } else if (rawMax <= 5.0) {
    domainMax = 6.0;
  } else if (rawMax <= 10.0) {
    domainMax = Math.ceil(rawMax * 1.25);
  } else {
    domainMax = Math.ceil(rawMax * 1.15);
  }

  const getX = (index: number) => paddingX + (index / (points.length - 1)) * (width - paddingX * 2);
  const getY = (val: number) => height - paddingY - (val / domainMax) * (height - paddingY * 2);

  // Bottom zero baseline Y
  const zeroY = height - paddingY;

  // Confidence interval polygon coordinates
  const confidenceAreaPoints = points
    .map((p, i) => `${getX(i)},${getY(p.upperBound)}`)
    .concat(
      points
        .slice()
        .reverse()
        .map((p, i) => `${getX(points.length - 1 - i)},${getY(p.lowerBound)}`)
    )
    .join(" ");

  // Historical path (indices 0 to 13)
  const historicalPoints = points
    .map((p, i) => (p.historical !== undefined && i < 14 ? `${getX(i)},${getY(p.historical)}` : null))
    .filter(Boolean);
  const historicalPath = historicalPoints.length > 0 ? `M ${historicalPoints.join(" L ")}` : "";

  // Historical gradient area (closed down to zero baseline)
  const historicalAreaPath =
    historicalPoints.length > 0
      ? `M ${historicalPoints.join(" L ")} L ${getX(Math.min(13, points.length - 1))},${zeroY} L ${getX(0)},${zeroY} Z`
      : "";

  // Forecast path (from index 13 onwards)
  const forecastPathPoints = points.slice(13).map((p, i) => `${getX(i + 13)},${getY(p.forecasted)}`);
  const forecastPath = forecastPathPoints.length > 0 ? `M ${forecastPathPoints.join(" L ")}` : "";

  // Forecast gradient area (closed down to zero baseline)
  const forecastAreaPath =
    forecastPathPoints.length > 0
      ? `M ${forecastPathPoints.join(" L ")} L ${getX(points.length - 1)},${zeroY} L ${getX(13)},${zeroY} Z`
      : "";

  // Dynamic grid line ratios (5 clean horizontal ticks)
  const tickRatios = [0, 0.25, 0.5, 0.75, 1];

  // Selected or active point data
  const currentActive = activePoint || defaultPoint;
  const activeIndex = currentActive ? points.findIndex((p) => p.date === currentActive.date) : -1;
  const activeX = activeIndex >= 0 ? getX(activeIndex) : null;
  const activeY = currentActive
    ? getY(activeIndex >= 13 ? currentActive.forecasted : currentActive.historical ?? currentActive.forecasted)
    : null;

  // 14-day total calculations for quick metrics
  const totalObserved14d = points
    .slice(0, 14)
    .reduce((sum, p) => sum + (p.historical || p.forecasted || 0), 0);
  const totalForecast14d = points
    .slice(13)
    .reduce((sum, p) => sum + (p.forecasted || 0), 0);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card/95 via-card/85 to-card/60 p-4 sm:p-6 shadow-md backdrop-blur-md">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20">
              {product.sku}
            </span>
            <h4 className="font-extrabold text-foreground text-sm sm:text-base tracking-tight">
              {product.title}
            </h4>
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-foreground/80">14-Day Past Sales</span>
            <span className="text-muted-foreground/60">&rarr;</span>
            <span className="text-indigo-400 font-bold">14-Day Holt-Winters AI Demand Forecast</span>
            <InfoTooltip
              title="Holt-Winters Time-Series Model"
              description="A machine learning forecasting engine that analyzes level, trend, and seasonality patterns from your real order history to predict future daily unit demand."
              whyItMatters="Avoids stockouts on fast-moving items and avoids tying up capital on slow items."
              actionHint="Use the forecast trend line to decide exact supplier replenishment batches."
            />
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs shrink-0">
          <div className="flex items-center gap-1.5 rounded-xl bg-indigo-500/10 px-3 py-1.5 font-bold text-indigo-400 border border-indigo-500/25 shadow-xs">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{product.dailyVelocity7d} u/day</span>
            <InfoTooltip
              title="7-Day Daily Velocity"
              description="Average number of units sold per day over the last 7 days."
              whyItMatters="Reflects current sales speed. A velocity of 0.2 means 1 unit sells every 5 days."
            />
          </div>

          <div
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold border shadow-xs ${
              product.stockoutRisk === "critical"
                ? "bg-rose-500/10 text-rose-400 border-rose-500/25"
                : product.stockoutRisk === "warning"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
            }`}
          >
            {product.stockoutRisk === "critical" ? (
              <AlertTriangle className="h-3.5 w-3.5" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5" />
            )}
            <span>{product.daysOfSupply}d Runway</span>
            <InfoTooltip
              title="Days of Supply (Stock Runway)"
              description="How many days your current stock will last at current daily sales velocity before hitting zero."
              whyItMatters="If supplier lead time is 6 days but runway is 5 days, you will be out of stock before delivery arrives."
            />
          </div>
        </div>
      </div>

      {/* Summary KPI Strip Above Chart */}
      <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="rounded-xl border border-border/40 bg-card/60 p-2.5">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">14d Past Total</span>
          <span className="text-sm font-black text-foreground mt-0.5 block font-mono">
            {Math.round(totalObserved14d * 10) / 10} units
          </span>
        </div>
        <div className="rounded-xl border border-indigo-500/25 bg-indigo-500/5 p-2.5">
          <span className="text-[10px] uppercase font-bold text-indigo-400 block">14d AI Expected</span>
          <span className="text-sm font-black text-indigo-400 mt-0.5 block font-mono">
            {Math.round(totalForecast14d * 10) / 10} units
          </span>
        </div>
        <div className="rounded-xl border border-border/40 bg-card/60 p-2.5">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Current On Hand</span>
          <span className="text-sm font-black text-foreground mt-0.5 block font-mono">
            {product.currentStock} units
          </span>
        </div>
        <div className="rounded-xl border border-border/40 bg-card/60 p-2.5">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Stockout Horizon</span>
          <span
            className={`text-sm font-black mt-0.5 block font-mono ${
              product.daysOfSupply < 3.5 ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {product.daysOfSupply <= 0 ? "Out of Stock" : `~${product.daysOfSupply} Days Left`}
          </span>
        </div>
      </div>

      {/* Legend & Navigation Helper */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs bg-muted/30 border border-border/40 rounded-xl px-3.5 py-2">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-foreground/80">
            <span className="h-2 w-4 rounded-full bg-sky-500" />
            <span>Observed Sales (Past 14d)</span>
          </span>
          <span className="flex items-center gap-1.5 font-bold text-indigo-400">
            <span className="h-2 w-4 rounded-full bg-indigo-500 border-b-2 border-dashed border-white" />
            <span>Holt-Winters Forecast (Next 14d)</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
            <span className="h-2.5 w-3.5 rounded bg-purple-500/20 border border-purple-500/40" />
            <span>95% Confidence Band</span>
          </span>
        </div>
        <span className="text-[11px] text-indigo-400 font-semibold hidden sm:inline">
          💡 Click or hover any node on the line to inspect date & predicted units
        </span>
      </div>

      {/* SVG Chart Area */}
      <div className="relative mt-3 w-full overflow-x-auto scrollbar-thin">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[500px] select-none overflow-visible"
        >
          <defs>
            {/* Historical Area Gradient */}
            <linearGradient id="histAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
            </linearGradient>

            {/* Forecast Area Gradient */}
            <linearGradient id="forecastAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>

            {/* Confidence Interval Band Fill */}
            <linearGradient id="ciBandGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.05" />
            </linearGradient>

            {/* Glowing Drop-Shadow for curves */}
            <filter id="glowShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6366f1" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Grid lines with intelligent human-friendly Y ticks */}
          {tickRatios.map((ratio, i) => {
            const val = domainMax * (1 - ratio);
            const y = paddingY + ratio * (height - paddingY * 2);
            const displayVal = domainMax <= 1 ? (Math.round(val * 100) / 100).toFixed(2) : (Math.round(val * 10) / 10).toString();

            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.12}
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-muted-foreground text-[10px] font-mono font-bold"
                >
                  {displayVal}
                </text>
              </g>
            );
          })}

          {/* Vertical divider separating History and Forecast */}
          <line
            x1={getX(13)}
            y1={paddingY - 5}
            x2={getX(13)}
            y2={zeroY}
            stroke="#6366f1"
            strokeOpacity={0.5}
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
          <text
            x={getX(13) - 8}
            y={paddingY - 10}
            textAnchor="end"
            className="fill-muted-foreground text-[10px] font-bold tracking-wider"
          >
            PAST SALES
          </text>
          <text
            x={getX(13) + 8}
            y={paddingY - 10}
            textAnchor="start"
            className="fill-indigo-400 text-[10px] font-black tracking-wider"
          >
            AI FORECAST &rarr;
          </text>

          {/* Shaded 95% Confidence Interval Band */}
          <polygon points={confidenceAreaPoints} fill="url(#ciBandGrad)" stroke="#a855f7" strokeOpacity={0.25} strokeWidth={1} />

          {/* Historical Soft Gradient Area Fill */}
          {historicalAreaPath && <path d={historicalAreaPath} fill="url(#histAreaGrad)" />}

          {/* Forecast Soft Gradient Area Fill */}
          {forecastAreaPath && <path d={forecastAreaPath} fill="url(#forecastAreaGrad)" />}

          {/* Historical Solid Line */}
          {historicalPath && (
            <path
              d={historicalPath}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Forecasted Glowing Dotted Line */}
          {forecastPath && (
            <path
              d={forecastPath}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth={3.5}
              strokeDasharray="6 4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glowShadow)"
            />
          )}

          {/* Active Vertical Crosshair Line */}
          {activeX !== null && (
            <line
              x1={activeX}
              y1={paddingY}
              x2={activeX}
              y2={zeroY}
              stroke="#8b5cf6"
              strokeOpacity={0.4}
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
          )}

          {/* Active Horizontal Crosshair Line */}
          {activeX !== null && activeY !== null && (
            <line
              x1={paddingX}
              y1={activeY}
              x2={activeX}
              y2={activeY}
              stroke="#8b5cf6"
              strokeOpacity={0.3}
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
          )}

          {/* Data Points on Hover / Touch */}
          {points.map((p, i) => {
            const x = getX(i);
            const isFuture = i >= 13;
            const y = getY(isFuture ? p.forecasted : p.historical ?? p.forecasted);
            const isSelected = currentActive?.date === p.date;

            return (
              <g
                key={i}
                className="cursor-pointer group"
                onClick={() => setActivePoint(p)}
                onMouseEnter={() => setActivePoint(p)}
              >
                {/* Large touch target */}
                <circle cx={x} cy={y} r={16} fill="transparent" />

                {/* Outer halo when selected or hovered */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r={9}
                    className={isFuture ? "fill-purple-500/20 stroke-purple-500" : "fill-sky-500/20 stroke-sky-500"}
                    strokeWidth={1.5}
                  />
                )}

                {/* Main point circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 6 : 4}
                  className={`transition-all duration-150 ${
                    isFuture
                      ? "fill-purple-500 stroke-card stroke-2 group-hover:scale-125"
                      : "fill-sky-500 stroke-card stroke-2 group-hover:scale-125"
                  }`}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover / Active Inspector Bar */}
        {currentActive && (
          <div className="mt-3 rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-card/95 via-card to-card/95 p-3.5 shadow-lg backdrop-blur-md text-xs animate-in fade-in duration-150 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                <Calendar className="h-4 w-4" />
              </span>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                  {activeIndex >= 13 ? "Projected Horizon Date" : "Observed Sales Record"}
                </span>
                <span className="font-extrabold text-foreground text-xs">{currentActive.date}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs">
              {currentActive.historical !== undefined && (
                <div>
                  <span className="text-muted-foreground block text-[10px] font-medium">Observed Sales:</span>
                  <span className="font-mono font-bold text-sky-400 text-sm">{currentActive.historical} units</span>
                </div>
              )}
              <div>
                <span className="text-indigo-400 block text-[10px] font-bold">Predicted Daily Demand:</span>
                <span className="font-mono font-bold text-indigo-400 text-sm">
                  {currentActive.forecasted} units/day
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] font-medium">95% Confidence Interval:</span>
                <span className="font-mono font-bold text-muted-foreground text-xs">
                  [{currentActive.lowerBound} &ndash; {currentActive.upperBound} units]
                </span>
              </div>
            </div>

            <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              {activeIndex >= 13 ? "AI Holt-Winters Forecast" : "Verified Past Order"}
            </span>
          </div>
        )}
      </div>

      {/* Footer Metrics Breakdown with Pro Tooltips */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border-t border-border/40 pt-4 text-xs">
        {/* Reorder Point */}
        <div className="rounded-2xl bg-card/60 border border-border/40 p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Reorder Point (ROP)
            </p>
            <InfoTooltip
              title="Reorder Point (ROP)"
              description="The minimum stock threshold. When your on-hand inventory drops to or below this amount, place an order with your supplier immediately."
              whyItMatters="Ensures new shipments arrive right before stock drops to zero."
              actionHint="Order today if Current Stock <= Reorder Point."
            />
          </div>
          <p className="text-base font-black text-foreground mt-1 font-mono">{product.reorderPoint} units</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Trigger order when stock &le; {product.reorderPoint}
          </p>
        </div>

        {/* Recommended EOQ */}
        <div className="rounded-2xl bg-card/60 border border-indigo-500/30 p-3.5 bg-indigo-500/5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">
              Recommended EOQ
            </p>
            <InfoTooltip
              title="Economic Order Quantity (EOQ)"
              description="The optimal number of units to reorder from your supplier in one batch, mathematically calculated to minimize storage fees and shipping overhead."
              whyItMatters="Prevents ordering too frequently (high delivery fees) or ordering way too much (capital stuck in warehouse)."
              actionHint="Recommended batch size for standard 30-day replenishment."
            />
          </div>
          <p className="text-base font-black text-indigo-400 mt-1 font-mono">+{product.recommendedReorderQty} units</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">30-day optimal reorder batch</p>
        </div>

        {/* Safety Stock */}
        <div className="rounded-2xl bg-card/60 border border-border/40 p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Safety Stock Buffer
            </p>
            <InfoTooltip
              title="Safety Stock Buffer"
              description="A permanent emergency buffer kept in reserve to protect against supplier delays or unexpected flash-sale demand spikes."
              whyItMatters="Without a safety cushion, a 2-day delivery delay means 2 full days of zero sales."
              actionHint="Calculated for 98.0% customer service guarantee."
            />
          </div>
          <p className="text-base font-black text-foreground mt-1 font-mono">{product.safetyStock} units</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">98.0% target fulfillment SLA</p>
        </div>

        {/* Revenue at Risk */}
        <div className="rounded-2xl bg-card/60 border border-border/40 p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              30d Revenue at Risk
            </p>
            <InfoTooltip
              title="30-Day Revenue at Risk"
              description="The estimated dollar sales you will miss out on over the next 30 days if this item runs out of stock without a replenishment order."
              whyItMatters="Reveals exactly how much money your business is leaving on the table."
              actionHint="Reorder immediately to recover this potential lost revenue."
            />
          </div>
          <p
            className={`text-base font-black mt-1 font-mono ${
              product.revenueAtRisk > 0 ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            ${product.revenueAtRisk.toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Lost sales if out of stock</p>
        </div>
      </div>
    </div>
  );
}
