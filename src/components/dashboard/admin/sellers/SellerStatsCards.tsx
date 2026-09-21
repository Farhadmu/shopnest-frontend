"use client";

import React from "react";
import { Store, ShieldAlert, CheckCircle2, Clock, Mail } from "lucide-react";

export interface SellerCounts {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
  appeals: number;
}

export interface SellerStatsCardsProps {
  counts: SellerCounts;
  activeFilter?: string;
  onFilterSelect?: (filter: string) => void;
}

export function SellerStatsCards({ counts, activeFilter, onFilterSelect }: SellerStatsCardsProps) {
  const stats = [
    {
      id: "all",
      label: "Total Merchants",
      count: counts.all,
      sub: "Platform registrations",
      icon: Store,
      color: "text-text",
      bg: "bg-surface",
      border: "border-border",
    },
    {
      id: "pending",
      label: "Pending KYC",
      count: counts.pending,
      sub: "Awaiting verification",
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/5",
      border: "border-amber-500/20",
      urgent: counts.pending > 0,
    },
    {
      id: "appeals",
      label: "Appeals Desk",
      count: counts.appeals,
      sub: "Action required",
      icon: Mail,
      color: "text-primary",
      bg: "bg-primary/5",
      border: "border-primary/25",
      urgent: counts.appeals > 0,
    },
    {
      id: "approved",
      label: "Active Stores",
      count: counts.approved,
      sub: "Live storefronts",
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/20",
    },
    {
      id: "suspended",
      label: "Suspended",
      count: counts.suspended,
      sub: "Compliance hold",
      icon: ShieldAlert,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/5",
      border: "border-rose-500/20",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((s) => {
        const Icon = s.icon;
        const isActive = activeFilter === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onFilterSelect && onFilterSelect(s.id)}
            className={`group flex flex-col justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer ${
              isActive
                ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20 scale-[1.02]"
                : `${s.bg} ${s.border} hover:border-primary/40 hover:shadow-xs`
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted group-hover:text-text transition">
                {s.label}
              </span>
              <div className="flex items-center gap-1.5">
                {s.urgent && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                )}
                <Icon size={15} className={`${s.color} opacity-80 group-hover:opacity-100 transition`} />
              </div>
            </div>

            <div className="mt-3">
              <span className={`text-2xl font-black tracking-tight ${s.color}`}>
                {s.count}
              </span>
              <p className="text-[11px] text-muted truncate mt-0.5">{s.sub}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
