import React from "react";

export interface SellerCounts {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
}

export interface SellerStatsCardsProps {
  counts: SellerCounts;
}

export function SellerStatsCards({ counts }: SellerStatsCardsProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Total Applications</p>
        <p className="mt-1 text-2xl font-black text-text">{counts.all}</p>
        <p className="text-[10px] text-muted mt-0.5">Registered merchants</p>
      </div>

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Pending Review
          </p>
          {counts.pending > 0 && (
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
          )}
        </div>
        <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">{counts.pending}</p>
        <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">Requires admin action</p>
      </div>

      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-sm">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Active Stores
        </p>
        <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{counts.approved}</p>
        <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">Verified sellers</p>
      </div>

      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 shadow-sm">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
          Suspended / Rejected
        </p>
        <p className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400">{counts.rejected + counts.suspended}</p>
        <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">Restricted or declined</p>
      </div>
    </div>
  );
}
