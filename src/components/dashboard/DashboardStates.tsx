"use client";

import { ReactNode } from "react";

export function LoadingCard({ height = "h-24" }: { height?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-surface p-5 animate-pulse ${height}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-xl bg-muted-bg" />
        <div className="h-4 w-24 rounded-lg bg-muted-bg" />
      </div>
      <div className="h-8 w-32 rounded-lg bg-muted-bg mb-2" />
      <div className="h-3 w-20 rounded-lg bg-muted-bg" />
    </div>
  );
}

export function LoadingGrid({ count = 6, height = "h-24" }: { count?: number; height?: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} height={height} />
      ))}
    </div>
  );
}

export function LoadingChart({ height = "h-64" }: { height?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-surface p-6 animate-pulse ${height}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-32 rounded-lg bg-muted-bg" />
        <div className="h-8 w-24 rounded-lg bg-muted-bg" />
      </div>
      <div className="flex items-end gap-2 h-40">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-lg bg-muted-bg"
            style={{ height: `${30 + Math.random() * 70}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-error/20 bg-error/5 p-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-xl">
        ⚠️
      </div>
      <h3 className="text-sm font-bold text-error mb-1">Something went wrong</h3>
      <p className="text-xs text-muted mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-error px-4 py-2 text-xs font-bold text-white hover:bg-error/80 transition"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon = "📦", title, description, action }: { icon?: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-8 text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
        {icon}
      </div>
      <h3 className="text-base font-bold text-text mb-1">{title}</h3>
      <p className="text-xs text-muted mb-4 max-w-sm mx-auto">{description}</p>
      {action}
    </div>
  );
}

export function LoadingTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="border-b border-border p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 rounded-lg bg-muted-bg" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-border/50 p-4 last:border-0">
          <div className="grid gap-4 items-center" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-4 rounded-lg bg-muted-bg animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
