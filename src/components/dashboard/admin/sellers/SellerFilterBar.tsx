"use client";

import React from "react";
import { FiSearch, FiRefreshCw } from "react-icons/fi";
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
    { id: "all", label: "All Stores", count: counts.all },
    { id: "pending", label: "Pending Review", count: counts.pending },
    { id: "approved", label: "Approved", count: counts.approved },
    { id: "rejected", label: "Rejected", count: counts.rejected },
    { id: "suspended", label: "Suspended", count: counts.suspended },
  ];

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onStatusChange(tab.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface text-muted hover:bg-muted-bg hover:text-text border border-border"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  isActive ? "bg-white/20 text-white" : "bg-muted-bg text-muted"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Refresh Actions */}
      <div className="flex items-center gap-2">
        <form onSubmit={onSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-2.5 text-muted" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search store, owner, phone..."
              className="w-48 sm:w-60 rounded-xl border border-border bg-surface pl-9 pr-3 py-2 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white hover:bg-primary-hover transition cursor-pointer"
          >
            Filter
          </button>
        </form>

        <button
          type="button"
          onClick={onRefresh}
          title="Refresh Applications"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-text hover:bg-muted-bg transition cursor-pointer"
        >
          <FiRefreshCw size={13} />
        </button>
      </div>
    </div>
  );
}
