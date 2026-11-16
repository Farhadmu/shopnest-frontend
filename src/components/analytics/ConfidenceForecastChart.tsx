"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Calendar,
  Flame,
  ShieldCheck,
  Zap,
  Info,
} from "lucide-react";

export interface ForecastPoint {
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
  confidenceScore?: number;
  growthRate?: string;
}

/**
 * Generates a smooth cubic bezier SVG path passing through every coordinate point.
 * Uses Catmull-Rom to Cubic Bézier spline interpolation for natural analytics curves.
 */
function getSmoothCurvedPath(pts: Array<{ x: number; y: number }>): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  if (pts.length === 2) return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} L ${pts[1].x.toFixed(1)} ${pts[1].y.toFixed(1)}`;

  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 >= pts.length ? pts.length - 1 : i + 2];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export function ConfidenceForecastChart({
  data,
  height = 290,
  confidenceScore = 82,
  growthRate = "+8.5%",
}: ConfidenceForecastChartProps) {
  // Chart dimensions & internal bounds
  const width = 680;
  const padX = 52;
  const padTop = 26;
  const padBottom = 38;
  const plotW = width - padX - 24;
  const plotH = height - padTop - padBottom;
  const floorY = height - padBottom;

  // Key aggregations & analytics
  const {
    peakIdx,
    weekdayAvg,
    weekendAvg,
    totalExpected,
    totalOrders,
    minVal,
    maxVal,
  } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        peakIdx: 0,
        weekdayAvg: 0,
        weekendAvg: 0,
        totalExpected: 0,
        totalOrders: 0,
        minVal: 0,
        maxVal: 1,
      };
    }

    let pIdx = 0;
    let maxRev = -1;
    let sumWeekday = 0;
    let countWeekday = 0;
    let sumWeekend = 0;
    let countWeekend = 0;
    let sumTotal = 0;
    let sumOrders = 0;

    data.forEach((d, i) => {
      sumTotal += d.expectedRevenue;
      sumOrders += d.expectedOrders;

      if (d.expectedRevenue > maxRev) {
        maxRev = d.expectedRevenue;
        pIdx = i;
      }

      const dateObj = new Date(d.date);
      const dayOfWeek = isNaN(dateObj.getTime()) ? (i % 7) : dateObj.getDay();
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        // Friday or Saturday
        sumWeekend += d.expectedRevenue;
        countWeekend++;
      } else {
        sumWeekday += d.expectedRevenue;
        countWeekday++;
      }
    });

    const allLowers = data.map((d) => d.lowerBand);
    const allUppers = data.map((d) => d.upperBand);
    const calculatedMin = Math.max(0, Math.min(...allLowers) * 0.85);
    const calculatedMax = Math.max(...allUppers) * 1.08;

    return {
      peakIdx: pIdx,
      weekdayAvg: countWeekday > 0 ? Math.round(sumWeekday / countWeekday) : 0,
      weekendAvg: countWeekend > 0 ? Math.round(sumWeekend / countWeekend) : 0,
      totalExpected: sumTotal,
      totalOrders: sumOrders,
      minVal: calculatedMin,
      maxVal: calculatedMax || 1,
    };
  }, [data]);

  // Active / selected inspector point (defaults to the peak day for instant value)
  const [activeIdx, setActiveIdx] = useState<number>(peakIdx);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 text-xs text-muted-foreground p-4 text-center">
        <TrendingUp className="h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="font-semibold text-foreground">No forecast time-series points available</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          At least 1 confirmed customer order is required to build your store trajectory.
        </p>
      </div>
    );
  }

  const range = maxVal - minVal || 1;
  const getX = (i: number) => padX + (i / (data.length - 1 || 1)) * plotW;
  const getY = (val: number) => padTop + plotH - ((val - minVal) / range) * plotH;

  // Projected trajectory points
  const projectedPts = data.map((d, i) => ({ x: getX(i), y: getY(d.expectedRevenue) }));
  const smoothForecastLine = getSmoothCurvedPath(projectedPts);

  // Gradient area under the forecast line down to the floor baseline
  const forecastAreaPath =
    projectedPts.length > 0
      ? `${smoothForecastLine} L ${projectedPts[projectedPts.length - 1].x.toFixed(1)} ${floorY} L ${projectedPts[0].x.toFixed(1)} ${floorY} Z`
      : "";

  // Upper & Lower coordinates for the smooth 88% confidence band cone
  const upperPts = data.map((d, i) => ({ x: getX(i), y: getY(d.upperBand) }));
  const lowerPts = data.map((d, i) => ({ x: getX(i), y: getY(d.lowerBand) }));

  // Reverse lower points to close the polygon smoothly
  const revLower = lowerPts.slice().reverse();
  let smoothConfidenceBandPath = getSmoothCurvedPath(upperPts);
  if (revLower.length > 0) {
    smoothConfidenceBandPath += ` L ${revLower[0].x.toFixed(1)} ${revLower[0].y.toFixed(1)}`;
    for (let i = 0; i < revLower.length - 1; i++) {
      const p0 = revLower[i === 0 ? 0 : i - 1];
      const p1 = revLower[i];
      const p2 = revLower[i + 1];
      const p3 = revLower[i + 2 >= revLower.length ? revLower.length - 1 : i + 2];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      smoothConfidenceBandPath += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    smoothConfidenceBandPath += " Z";
  }

  // Active point details
  const activePoint = data[activeIdx] || data[0];
  const activeX = getX(activeIdx);
  const activeY = getY(activePoint.expectedRevenue);

  const activeDateObj = new Date(activePoint.date);
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const activeDayName = isNaN(activeDateObj.getTime())
    ? `Day ${activePoint.day}`
    : dayNames[activeDateObj.getDay()];
  const isWeekendActive =
    !isNaN(activeDateObj.getTime()) &&
    (activeDateObj.getDay() === 5 || activeDateObj.getDay() === 6);

  return (
    <div className="relative w-full space-y-4">
      {/* Top Pro KPI Quick Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded-2xl border border-border/60 bg-card/60 p-3 backdrop-blur-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3 text-sky-400" />
            Weekday Pace
          </span>
          <p className="text-sm font-black text-foreground mt-0.5 font-mono">
            ৳{weekdayAvg.toLocaleString()}
            <span className="text-[10px] font-normal text-muted-foreground ml-1">/ day</span>
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3 backdrop-blur-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400 flex items-center gap-1">
            <Flame className="h-3 w-3 text-amber-500" />
            Weekend Surge
          </span>
          <p className="text-sm font-black text-amber-600 dark:text-amber-400 mt-0.5 font-mono">
            ৳{weekendAvg.toLocaleString()}
            <span className="text-[10px] font-bold text-emerald-500 ml-1">+25%</span>
          </p>
        </div>

        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-3 backdrop-blur-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
            <Zap className="h-3 w-3 text-indigo-400" />
            Peak Day
          </span>
          <p className="text-sm font-black text-indigo-400 mt-0.5 font-mono truncate">
            {data[peakIdx]?.date || `Day ${data[peakIdx]?.day}`}
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/60 p-3 backdrop-blur-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            Model Accuracy
          </span>
          <p className="text-sm font-black text-emerald-500 dark:text-emerald-400 mt-0.5 font-mono">
            {confidenceScore}%
            <span className="text-[10px] font-normal text-muted-foreground ml-1">({growthRate})</span>
          </p>
        </div>
      </div>

      {/* Interactive Active Day Telemetry Ribbon */}
      <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-card/80 p-3.5 sm:p-4 text-xs shadow-sm backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 font-bold shrink-0 font-mono">
            #{activePoint.day}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground text-sm">
                {activePoint.date} &bull; {activeDayName}
              </span>
              {isWeekendActive ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                  <Flame className="h-3 w-3 text-amber-400" /> Weekend Shopping Surge
                </span>
              ) : (
                <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Regular Weekday
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Confidence Range:{" "}
              <span className="font-mono text-foreground font-semibold">
                ৳{activePoint.lowerBand.toLocaleString()} &ndash; ৳{activePoint.upperBand.toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-left md:text-right">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Projected Revenue</span>
            <span className="text-base sm:text-lg font-black text-sky-500 dark:text-sky-400 font-mono">
              ৳{activePoint.expectedRevenue.toLocaleString()}
            </span>
          </div>
          <div className="text-left md:text-right border-l border-border/60 pl-3">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Est. Volume</span>
            <span className="text-base sm:text-lg font-black text-foreground font-mono">
              ~{activePoint.expectedOrders} <span className="text-xs font-normal text-muted-foreground">orders</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main SVG Curve & Chart Canvas */}
      <div className="relative rounded-3xl border border-border/80 bg-gradient-to-b from-card/90 via-card/75 to-card/50 p-3 sm:p-5 shadow-md backdrop-blur-md overflow-hidden">
        {/* Chart Header & Legend */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">30-Day Forward Revenue Trajectory</span>
            <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded">
              Total ৳{totalExpected.toLocaleString()} &bull; {totalOrders} orders
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-3.5 rounded bg-indigo-500/20 border border-indigo-500/40" />
              <span>88% Confidence Interval</span>
            </span>
            <span className="flex items-center gap-1.5 font-bold text-sky-400">
              <span className="h-2 w-4 rounded-full bg-sky-500" />
              <span>Projected Daily Value</span>
            </span>
          </div>
        </div>

        {/* SVG Container with Horizontal Scroll fallback on very small screens */}
        <div className="relative w-full overflow-x-auto scrollbar-thin">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full min-w-[580px] select-none overflow-visible"
          >
            <defs>
              {/* Forecast Area Gradient */}
              <linearGradient id="forecastAreaGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.32" />
                <stop offset="60%" stopColor="#0ea5e9" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
              </linearGradient>

              {/* Confidence Band Gradient */}
              <linearGradient id="confidenceConeGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.06" />
              </linearGradient>

              {/* Glow filter for the central projection path */}
              <filter id="forecastLineGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0ea5e9" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Y-Axis Horizontal Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((pct, i) => {
              const y = padTop + plotH * (1 - pct);
              const labelVal = Math.round(minVal + pct * range);
              return (
                <g key={i}>
                  <line
                    x1={padX}
                    y1={y}
                    x2={width - 20}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity={pct === 0 ? 0.2 : 0.07}
                    strokeDasharray={pct === 0 ? undefined : "3 3"}
                  />
                  <text
                    x={padX - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    className="fill-muted-foreground text-[9px] font-mono font-medium"
                  >
                    ৳{(labelVal / 1000).toFixed(labelVal >= 10000 ? 0 : 1)}k
                  </text>
                </g>
              );
            })}

            {/* Weekend Highlight Bands in background */}
            {data.map((d, i) => {
              const dateObj = new Date(d.date);
              const dayOfWeek = isNaN(dateObj.getTime()) ? (i % 7) : dateObj.getDay();
              if (dayOfWeek === 5 || dayOfWeek === 6) {
                const x = getX(i);
                const step = plotW / (data.length - 1 || 1);
                return (
                  <rect
                    key={`wk-${i}`}
                    x={x - step / 2}
                    y={padTop}
                    width={step}
                    height={plotH}
                    fill="#f59e0b"
                    fillOpacity={0.035}
                  />
                );
              }
              return null;
            })}

            {/* Smooth Confidence Band Cone */}
            {smoothConfidenceBandPath && (
              <path
                d={smoothConfidenceBandPath}
                fill="url(#confidenceConeGlow)"
                stroke="#8b5cf6"
                strokeOpacity={0.25}
                strokeWidth={1}
                strokeDasharray="2 2"
              />
            )}

            {/* Gradient fill under central projected curve */}
            {forecastAreaPath && <path d={forecastAreaPath} fill="url(#forecastAreaGlow)" />}

            {/* Smooth Central Forecast Curved Line */}
            {smoothForecastLine && (
              <path
                d={smoothForecastLine}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#forecastLineGlow)"
              />
            )}

            {/* Active Vertical Crosshair Line */}
            <line
              x1={activeX}
              y1={padTop}
              x2={activeX}
              y2={floorY}
              stroke="#0ea5e9"
              strokeOpacity={0.5}
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />

            {/* Active Horizontal Value Line */}
            <line
              x1={padX}
              y1={activeY}
              x2={activeX}
              y2={activeY}
              stroke="#0ea5e9"
              strokeOpacity={0.4}
              strokeWidth={1}
              strokeDasharray="2 2"
            />

            {/* Interactive Data Nodes on Curve */}
            {data.map((d, i) => {
              const x = getX(i);
              const y = getY(d.expectedRevenue);
              const isSelected = activeIdx === i;
              const dateObj = new Date(d.date);
              const isWeekend =
                !isNaN(dateObj.getTime()) && (dateObj.getDay() === 5 || dateObj.getDay() === 6);

              // X-axis date labels: Day 1, 7, 14, 21, 30
              const showLabel = i === 0 || i === 6 || i === 13 || i === 20 || i === 29;

              return (
                <g
                  key={i}
                  className="cursor-pointer group"
                  onClick={() => setActiveIdx(i)}
                  onMouseEnter={() => setActiveIdx(i)}
                >
                  {/* Expanded invisible touch hit target for comfortable tap/hover */}
                  <circle cx={x} cy={y} r={14} fill="transparent" />

                  {/* Node Outer Halo when active */}
                  {isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r={9}
                      className={isWeekend ? "fill-amber-500/20 stroke-amber-500" : "fill-sky-500/20 stroke-sky-500"}
                      strokeWidth={2}
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 5 : isWeekend ? 3.5 : 3}
                    className={
                      isSelected
                        ? isWeekend
                          ? "fill-amber-400 stroke-white stroke-2"
                          : "fill-sky-400 stroke-white stroke-2"
                        : isWeekend
                        ? "fill-amber-400/90 group-hover:fill-amber-300 transition-colors"
                        : "fill-sky-500 group-hover:fill-sky-300 transition-colors"
                    }
                  />

                  {/* X-Axis Milestone Label */}
                  {showLabel && (
                    <text
                      x={x}
                      y={height - 12}
                      textAnchor="middle"
                      className={`text-[9px] font-mono transition-colors ${
                        isSelected
                          ? "fill-sky-400 font-bold"
                          : "fill-muted-foreground font-semibold"
                      }`}
                    >
                      Day {d.day}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Interaction helper footnote */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-2 border-t border-border/30">
          <span className="flex items-center gap-1.5">
            <Info className="h-3 w-3 text-sky-400" />
            <span>Hover or tap any date along the trajectory line to inspect estimated revenue and order breakdown.</span>
          </span>
          <span className="font-mono text-[10px] text-amber-500 font-bold">
            🔥 Yellow highlighted bands indicate Weekend Sales Surges (Fri/Sat)
          </span>
        </div>
      </div>
    </div>
  );
}
