"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes, FaArrowRight } from "react-icons/fa";

export { DashboardSidebarLayout } from "./DashboardLayout";
export { EmptyState, ErrorState, LoadingCard, LoadingGrid, LoadingChart, LoadingTable, FallbackIndicator, AiBadge } from "./DashboardStates";

export type DashboardLink = { label: string; href: string; icon: string; description: string };

export function DashboardHeader({
  title,
  subtitle,
  role,
  action,
  hideContinueShopping = false,
}: {
  title: string;
  subtitle?: string;
  role?: string;
  action?: ReactNode;
  hideContinueShopping?: boolean;
}) {
  return (
    <div className="mb-6 rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {role && (
            <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">
              {role} dashboard
            </p>
          )}
          <h1 className="mt-1 text-2xl font-black tracking-tight text-text sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{subtitle}</p>
          )}
        </div>
        {action || (!hideContinueShopping && (
          <Link
            href="/products"
            className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-text transition hover:border-primary/40 hover:text-primary shrink-0 w-fit"
          >
            <span>Continue shopping</span>
            <FaArrowRight size={10} />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function DashboardShell({
  title,
  subtitle,
  role,
  links,
  action,
  children,
  showContinueShopping = true,
}: {
  title?: string;
  subtitle?: string;
  role?: string;
  links?: DashboardLink[];
  action?: ReactNode;
  children: ReactNode;
  showContinueShopping?: boolean;
}) {
  return (
    <div className="space-y-6">
      {title && (
        <DashboardHeader
          title={title}
          subtitle={subtitle}
          role={role}
          action={action}
          hideContinueShopping={!showContinueShopping}
        />
      )}
      {children}
    </div>
  );
}

export function StatCard({
  icon,
  label,
  value,
  note,
  trend,
  color = "default",
}: {
  icon: string;
  label: string;
  value: string | number;
  note: string;
  trend?: string;
  color?: "default" | "success" | "warning" | "error" | "accent" | "secondary";
}) {
  const colorMap: Record<string, { bg: string; text: string; badge: string }> = {
    default: { bg: "bg-primary/10", text: "text-primary", badge: "bg-primary/10 text-primary" },
    success: { bg: "bg-success/10", text: "text-success", badge: "bg-success/10 text-success" },
    warning: { bg: "bg-warning/10", text: "text-warning", badge: "bg-warning/10 text-warning" },
    error: { bg: "bg-error/10", text: "text-error", badge: "bg-error/10 text-error" },
    accent: { bg: "bg-accent/10", text: "text-accent", badge: "bg-accent/10 text-accent" },
    secondary: { bg: "bg-secondary/10", text: "text-secondary", badge: "bg-secondary/10 text-secondary" },
  };
  const colors = colorMap[color] || colorMap.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-xl text-lg ${colors.bg}`}>{icon}</span>
        {trend ? (
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${colors.badge}`}>
            {trend}
          </span>
        ) : (
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${colors.badge}`}>
            Live
          </span>
        )}
      </div>
      <p className="mt-4 text-xs font-semibold text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-black ${colors.text}`}>{value}</p>
      <p className="mt-1 text-xs text-muted">{note}</p>
    </motion.div>
  );
}

export function FeatureGrid({ links }: { links: DashboardLink[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {links.map((item, index) => (
        <motion.div
          key={item.href}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
        >
          <Link
            href={item.href}
            className="block h-full rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-xl">
                {item.icon}
              </span>
              <div>
                <h3 className="font-extrabold text-text">{item.label}</h3>
                <p className="mt-1 text-xs leading-5 text-muted">{item.description}</p>
              </div>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary">
              Open feature <FaArrowRight size={10} />
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6 ${className || ""}`}>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-black text-text">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
