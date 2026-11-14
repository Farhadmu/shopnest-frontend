"use client";

import { useState } from "react";
import { DemandForecastPoint, ProductDemandMetrics } from "@/lib/api/demandiq";
import { TrendingUp, AlertTriangle, Calendar, ShieldCheck } from "lucide-react";
import { InfoTooltip } from "./InfoTooltip";

interface Props {
  product: ProductDemandMetrics;
}

export function TimeSeriesForecastChart({ product }: Props) {
  const [activePoint, setActivePoint] = useState<DemandForecastPoint | null>(null);
  const points = product.forecastPoints || [];

  if (points.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-border/60 text-xs text-muted-foreground p-4 text-center">
        Insufficient sales history to render time-series forecast. At least 7 days of order history is recommended.
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
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/50 p-4 sm:p-5 shadow-sm backdrop-blur-md">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
              {product.sku}
            </span>
            <h4 className="font-bold text-foreground text-sm tracking-tight">{product.title}</h4>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">
            <span>14-Day Past Sales</span>
            <span className="text-muted-foreground/60">&rarr;</span>
            <span className="text-indigo-400 font-medium">14-Day Holt-Winters AI Demand Forecast</span>
            <InfoTooltip
              title="Holt-Winters Forecasting"
              description="A machine learning time-series algorithm that analyzes level, trend, and seasonal patterns in your sales history to predict future daily unit demand."
              whyItMatters="Prevents under-ordering popular items and prevents over-ordering slow items."
              actionHint="Use the forecast line to decide whether to scale reorders up or down."
            />
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs shrink-0">
          <div className="flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-1 font-medium text-indigo-400 border border-indigo-500/20">
            <TrendingUp className="h-3 w-3" />
            <span>{product.dailyVelocity7d} u/day</span>
            <InfoTooltip
              title="Daily Velocity (7-Day)"
              description="Average number of units sold per day over the last 7 days."
              whyItMatters="Reflects your immediate sales speed. A high velocity means stock depletes rapidly."
              actionHint="Items selling >5 units/day should be monitored daily."
            />
          </div>

          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold border ${
              product.stockoutRisk === "critical"
                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                : product.stockoutRisk === "warning"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            }`}
          >
            {product.stockoutRisk === "critical" ? (
              <AlertTriangle className="h-3 w-3" />
            ) : (
              <ShieldCheck className="h-3 w-3" />
            )}
            <span>{product.daysOfSupply}d runway</span>
            <InfoTooltip
              title="Days of Supply (Stock Runway)"
              description="How many days your current stock (units) will last at current daily sales velocity before hitting zero."
              whyItMatters="If supplier delivery takes 6 days but your runway is 3 days, you are guaranteed to stock out for 3 days!"
              actionHint="Always reorder before runway drops below supplier lead time."
            />
          </div>
        </div>
      </div>

      {/* Legend & Interactive Hint */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] bg-muted/20 border border-border/30 rounded-xl px-3 py-1.5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-1 w-4 rounded-full bg-slate-400" />
            Observed Sales
          </span>
          <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
            <span className="h-1 w-4 rounded-full bg-indigo-500 border-b border-dashed" />
            AI Forecast
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground/80">
            <span className="h-2 w-3 rounded bg-indigo-500/20 border border-indigo-500/30" />
            95% Confidence Band
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground hidden sm:inline">
          💡 Tap or hover data points to see details
        </span>
      </div>

      {/* SVG Chart Area */}
      <div className="relative mt-3 w-full overflow-x-auto scrollbar-thin">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[340px] sm:min-w-[480px] select-none overflow-visible"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const val = maxVal * (1 - ratio);
            const y = paddingY + ratio * (height - paddingY * 2);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.08}
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-muted-foreground text-[9px] font-mono"
                >
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
          <text
            x={getX(13) - 6}
            y={paddingY - 8}
            textAnchor="end"
            className="fill-muted-foreground text-[9px] font-semibold"
          >
            PAST SALES
          </text>
          <text
            x={getX(13) + 6}
            y={paddingY - 8}
            textAnchor="start"
            className="fill-indigo-400 text-[9px] font-bold"
          >
            AI FORECAST &rarr;
          </text>

          {/* Shaded 95% Confidence Interval Band */}
          <polygon points={confidenceAreaPoints} fill="#6366f1" fillOpacity={0.12} />

          {/* Historical Solid Line */}
          {historicalPath && (
            <path
              d={historicalPath}
              fill="none"
              stroke="#94a3b8"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
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

          {/* Data Points on Hover / Touch */}
          {points.map((p, i) => {
            const x = getX(i);
            const isFuture = i >= 13;
            const y = getY(isFuture ? p.forecasted : p.historical || p.forecasted);
            const isSelected = activePoint?.date === p.date;

            return (
              <g
                key={i}
                className="cursor-pointer group"
                onClick={() => setActivePoint(isSelected ? null : p)}
                onMouseEnter={() => setActivePoint(p)}
              >
                {/* Invisible larger hit target for mobile tapping */}
                <circle cx={x} cy={y} r={14} fill="transparent" />
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 6 : 3.5}
                  className={`transition-all duration-150 ${
                    isFuture
                      ? "fill-indigo-500 stroke-card stroke-2 group-hover:scale-125"
                      : "fill-slate-400 stroke-card stroke-2"
                  } ${isSelected ? "ring-4 ring-indigo-500/40" : ""}`}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover / Tap Point Inspector Card */}
        {activePoint ? (
          <div className="mt-2 rounded-xl border border-indigo-500/40 bg-card/95 p-3 shadow-lg backdrop-blur-md text-xs animate-in fade-in duration-150 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
                <Calendar className="h-3.5 w-3.5" />
              </span>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Date</span>
                <span className="font-bold text-foreground text-xs">{activePoint.date}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              {activePoint.historical !== undefined && (
                <div>
                  <span className="text-muted-foreground block text-[10px]">Observed Sales:</span>
                  <span className="font-mono font-bold text-foreground">{activePoint.historical} units</span>
                </div>
              )}
              <div>
                <span className="text-indigo-400 block text-[10px] font-semibold">Predicted Demand:</span>
                <span className="font-mono font-bold text-indigo-400">{activePoint.forecasted} units/day</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">95% Confidence Range:</span>
                <span className="font-mono font-semibold text-muted-foreground">
                  [{activePoint.lowerBound} - {activePoint.upperBound} units]
                </span>
              </div>
            </div>

            <button
              onClick={() => setActivePoint(null)}
              className="text-xs text-muted-foreground hover:text-foreground underline sm:hidden"
            >
              Close
            </button>
          </div>
        ) : (
          <p className="mt-2 text-center text-[10px] text-muted-foreground italic sm:hidden">
            (Tap any point on the curve to inspect date & predicted units)
          </p>
        )}
      </div>

      {/* Footer Metrics Breakdown with Pro Tooltips */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border-t border-border/40 pt-4 text-xs">
        {/* Reorder Point */}
        <div className="rounded-xl bg-card/60 border border-border/40 p-3">
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
          <p className="text-base font-black text-foreground mt-1">{product.reorderPoint} units</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Trigger order when stock &le; {product.reorderPoint}
          </p>
        </div>

        {/* Recommended EOQ */}
        <div className="rounded-xl bg-card/60 border border-indigo-500/30 p-3 bg-indigo-500/5">
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
          <p className="text-base font-black text-indigo-400 mt-1">+{product.recommendedReorderQty} units</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">30-day optimal reorder batch</p>
        </div>

        {/* Safety Stock */}
        <div className="rounded-xl bg-card/60 border border-border/40 p-3">
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
          <p className="text-base font-black text-foreground mt-1">{product.safetyStock} units</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">98.0% target fulfillment SLA</p>
        </div>

        {/* Revenue at Risk */}
        <div className="rounded-xl bg-card/60 border border-border/40 p-3">
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
            className={`text-base font-black mt-1 ${
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
