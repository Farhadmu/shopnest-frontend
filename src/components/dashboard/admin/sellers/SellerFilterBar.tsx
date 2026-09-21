"use client";

import React from "react";
import {
  Search,
  RotateCcw,
  X,
  Store,
  Clock,
  Mail,
  CheckCircle2,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { SellerCounts } from "./SellerStatsCards";

export interface SellerFilterBarProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onRefresh: () => void;
  counts: SellerCounts;
}

export function SellerFilterBar({
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onRefresh,
  counts,
}: SellerFilterBarProps) {
  const tabs = [
    {
      id: "all",
      label: "All Stores",
      count: counts.all,
      icon: Store,
      isUrgent: false,
    },
    {
      id: "pending",
      label: "Pending KYC",
      count: counts.pending,
      icon: Clock,
      isUrgent: counts.pending > 0,
      urgentBadgeColor: "bg-amber-500 text-white",
    },
    {
      id: "appeals",
      label: "Appeals Desk",
      count: counts.appeals,
      icon: Mail,
      isUrgent: counts.appeals > 0,
      urgentBadgeColor: "bg-primary text-white animate-pulse",
    },
    {
      id: "approved",
      label: "Active Stores",
      count: counts.approved,
      icon: CheckCircle2,
      isUrgent: false,
    },
    {
      id: "suspended",
      label: "Suspended",
      count: counts.suspended,
      icon: ShieldAlert,
      isUrgent: false,
    },
    {
      id: "rejected",
      label: "Rejected",
      count: counts.rejected,
      icon: XCircle,
      isUrgent: false,
    },
  ];

  return (
    <div className="mb-6 rounded-2xl border border-border bg-surface p-3.5 sm:p-4 shadow-xs space-y-3">
      {/* 1. All Filter Tabs Displayed Clearly (Always fully visible) */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onStatusChange(tab.id)}
              className={`group flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-white shadow-xs"
                  : "bg-background border border-border/80 text-muted hover:border-primary/40 hover:text-text"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 transition ${
                  isActive ? "text-white" : "text-muted group-hover:text-text"
                }`}
              />
              <span>{tab.label}</span>
              <span
                className={`inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-black transition ${
                  isActive
                    ? "bg-white/20 text-white"
                    : tab.isUrgent
                    ? tab.urgentBadgeColor || "bg-primary/10 text-primary"
                    : "bg-muted-bg text-muted group-hover:bg-border group-hover:text-text"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Full Width Search & Quick Refresh Controls */}
      <div className="flex items-center gap-2 pt-2.5 border-t border-border/60">
        <form onSubmit={onSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by store name, merchant owner, email, phone or category..."
            className="w-full rounded-xl border border-border bg-background py-2 pl-9.5 pr-8 text-xs sm:text-sm text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:text-text hover:bg-muted-bg transition"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </form>

        <button
          type="button"
          onClick={onRefresh}
          title="Refresh Stores"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-muted hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition cursor-pointer shadow-xs active:scale-95 shrink-0"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
