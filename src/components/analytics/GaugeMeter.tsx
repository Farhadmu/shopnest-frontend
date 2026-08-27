"use client";

import React from "react";

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
  const clamped = Math.min(100, Math.max(0, score));
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = Math.PI * radius; // Half-circle
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  // Determine color theme
  let color = "#10b981"; // Success/Good
  if (type === "risk") {
    color = clamped >= 70 ? "#ef4444" : clamped >= 40 ? "#f59e0b" : "#10b981";
  } else {
    color = clamped >= 80 ? "#10b981" : clamped >= 60 ? "#f59e0b" : "#ef4444";
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size / 1.7 }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
          style={{ transform: "rotate(-180deg)" }}
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={0}
            strokeLinecap="round"
          />

          {/* Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Score overlay */}
        <div className="absolute top-1/2 -translate-y-2 text-center">
          <p className="text-3xl font-black tracking-tight text-text">{clamped}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">out of 100</p>
        </div>
      </div>

      <div className="mt-1">
        <h4 className="text-sm font-extrabold text-text">{title}</h4>
        {subtitle && <p className="mt-0.5 text-xs text-muted max-w-[190px]">{subtitle}</p>}
      </div>
    </div>
  );
}
