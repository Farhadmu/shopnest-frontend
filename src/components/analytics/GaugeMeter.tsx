"use client";

import React, { useId } from "react";

interface GaugeMeterProps {
  score: number; // 0 - 100
  title: string;
  subtitle?: string;
  size?: number;
  maxScore?: number;
  type?: "health" | "risk" | "security";
}

export function GaugeMeter({
  score,
  title,
  subtitle,
  size = 170,
  maxScore = 100,
  type = "health",
}: GaugeMeterProps) {
  const gradientId = useId();
  const clamped = Math.min(100, Math.max(0, Math.round(score)));

  // Proportional sizing
  const strokeWidth = Math.max(10, Math.round(size * 0.08));
  const padding = strokeWidth / 2 + 4;
  const radius = (size - padding * 2) / 2;
  const cx = size / 2;
  const cy = radius + padding;
  const svgHeight = cy + strokeWidth / 2 + 2;

  // Semicircle arc: starts from (cx - radius, cy), curves over the top to (cx + radius, cy)
  const startX = cx - radius;
  const startY = cy;
  const endX = cx + radius;
  const endY = cy;
  const arcPath = `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;

  const circumference = Math.PI * radius; // Arc length of semicircle
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  // Determine color theme & gradient
  let startColor = "#34d399";
  let endColor = "#10b981";

  if (type === "risk") {
    if (clamped >= 70) {
      startColor = "#f87171";
      endColor = "#ef4444";
    } else if (clamped >= 40) {
      startColor = "#fbbf24";
      endColor = "#f59e0b";
    } else {
      startColor = "#34d399";
      endColor = "#10b981";
    }
  } else {
    // health & security
    if (clamped >= 80) {
      startColor = "#34d399";
      endColor = "#10b981";
    } else if (clamped >= 60) {
      startColor = "#fbbf24";
      endColor = "#f59e0b";
    } else {
      startColor = "#f87171";
      endColor = "#ef4444";
    }
  }

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {/* Gauge Arc Graphic */}
      <div className="relative flex items-end justify-center" style={{ width: size, height: svgHeight }}>
        <svg
          width={size}
          height={svgHeight}
          viewBox={`0 0 ${size} ${svgHeight}`}
          className="block select-none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={startColor} />
              <stop offset="100%" stopColor={endColor} />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <path
            d={arcPath}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Progress Arc */}
          <path
            d={arcPath}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Score overlay centered inside the arc dome */}
        <div
          className="absolute inset-x-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ top: padding + strokeWidth, bottom: strokeWidth / 2 }}
        >
          <span className="text-3xl font-black tracking-tight text-text leading-none">
            {clamped}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted mt-1">
            out of {maxScore}
          </span>
        </div>
      </div>

      {/* Label and Subtitle */}
      <div className="mt-3 flex flex-col items-center">
        <h4 className="text-sm font-extrabold text-text tracking-tight">{title}</h4>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted max-w-[200px] leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

