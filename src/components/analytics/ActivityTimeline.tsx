"use client";

import React from "react";

interface TimelineItem {
  id: string;
  event: string;
  detail: string;
  timestamp: string | Date;
  severity?: string;
  icon?: string;
}

interface ActivityTimelineProps {
  items: TimelineItem[];
  emptyMessage?: string;
}

export function ActivityTimeline({ items, emptyMessage = "No recent events logged" }: ActivityTimelineProps) {
  if (!items || items.length === 0) {
    return <div className="p-6 text-center text-xs text-muted">{emptyMessage}</div>;
  }

  const formatTime = (ts: string | Date) => {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? String(ts) : d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border space-y-4">
      {items.map((item) => {
        return (
          <div key={item.id} className="relative group">
            {/* Timeline bullet */}
            <span className="absolute -left-6 top-1 grid h-5 w-5 place-items-center rounded-full bg-surface border-2 border-primary text-[10px] shadow-sm">
              {item.icon || "•"}
            </span>

            {/* Content */}
            <div className="rounded-xl border border-border bg-surface p-3.5 shadow-sm transition hover:border-primary/40">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-black text-text">{item.event}</p>
                <span className="text-[10px] font-semibold text-muted">{formatTime(item.timestamp)}</span>
              </div>
              <p className="mt-1 text-xs text-muted leading-relaxed">{item.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
