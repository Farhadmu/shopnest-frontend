"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { isDashboardLinkActive } from "@/lib/utils/nav";
import type { DashboardLink } from "@/components/dashboard/DashboardUI";
import { Sparkles } from "lucide-react";

export interface SidebarNavListProps {
  links: DashboardLink[];
  /** Called after a link is clicked — used to close the mobile drawer. */
  onNavigate?: () => void;
}

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 400,
  damping: 30,
} as const;

/**
 * Reusable scrollable nav list for the dashboard sidebar. Renders icon +
 * label rows with group headers, badges, and active-state highlights.
 * Enhanced with Framer Motion layoutId hover sliding transition, spring
 * physics (stiffness: 400, damping: 30), and subtle translateX.
 */
export function SidebarNavList({ links, onNavigate }: SidebarNavListProps) {
  const pathname = usePathname();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  // Group links if group properties exist
  const hasGroups = links.some((l) => l.group);

  if (!hasGroups) {
    return (
      <nav
        className="flex-1 space-y-1 overflow-y-auto p-3 custom-scrollbar"
        onMouseLeave={() => setHoveredHref(null)}
      >
        {links.map((item) => {
          const isActive = isDashboardLinkActive(pathname, item.href);
          const isHovered = hoveredHref === item.href;

          return (
            <motion.div
              key={item.href}
              animate={{ x: isHovered ? 5 : 0 }}
              transition={SPRING_TRANSITION}
              className="relative"
              onMouseEnter={() => setHoveredHref(item.href)}
              onFocus={() => setHoveredHref(item.href)}
              onBlur={() => setHoveredHref(null)}
            >
              <Link
                href={item.href}
                onClick={onNavigate}
                className={`group relative flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-colors duration-200 ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.01]"
                    : "text-muted hover:text-text"
                }`}
              >
                {/* Ambient sliding pill background */}
                <AnimatePresence>
                  {isHovered && !isActive && (
                    <motion.span
                      layoutId="hoverHighlight"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 rounded-xl bg-current/10 dark:bg-white/[0.08] pointer-events-none -z-0"
                      transition={SPRING_TRANSITION}
                    />
                  )}
                </AnimatePresence>

                <div className="relative z-10 flex items-center gap-2.5 truncate">
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm transition-colors ${
                      isActive ? "bg-white/20 text-white" : "bg-muted-bg text-muted group-hover:text-text"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="relative z-10 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-extrabold text-accent">
                    {item.badge}
                  </span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>
    );
  }

  // Group items by category
  const groups: Array<{ name: string; items: DashboardLink[] }> = [];
  for (const item of links) {
    const groupName = item.group || "MAIN";
    let grp = groups.find((g) => g.name === groupName);
    if (!grp) {
      grp = { name: groupName, items: [] };
      groups.push(grp);
    }
    grp.items.push(item);
  }

  return (
    <nav
      className="flex-1 space-y-4 overflow-y-auto p-3 custom-scrollbar"
      onMouseLeave={() => setHoveredHref(null)}
    >
      {groups.map((grp) => (
        <div key={grp.name} className="space-y-1">
          <div className="px-3 pb-1 text-[10px] font-black tracking-wider text-muted/70 uppercase">
            {grp.name}
          </div>
          <div className="space-y-0.5">
            {grp.items.map((item) => {
              const isActive = isDashboardLinkActive(pathname, item.href);
              const isAi = item.highlight || item.href.includes("ai");
              const isHovered = hoveredHref === item.href;

              return (
                <motion.div
                  key={item.href}
                  animate={{ x: isHovered ? 5 : 0 }}
                  transition={SPRING_TRANSITION}
                  className="relative"
                  onMouseEnter={() => setHoveredHref(item.href)}
                  onFocus={() => setHoveredHref(item.href)}
                  onBlur={() => setHoveredHref(null)}
                >
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={`group relative flex items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors duration-200 ${
                      isActive
                        ? "bg-primary text-white shadow-md shadow-primary/25 translate-x-0.5"
                        : isAi
                        ? "bg-gradient-to-r from-primary/10 via-accent/10 to-transparent text-primary hover:from-primary/20 hover:to-accent/10 border border-primary/20"
                        : "text-muted hover:text-text"
                    }`}
                  >
                    {/* Ambient sliding pill background */}
                    <AnimatePresence>
                      {isHovered && !isActive && (
                        <motion.span
                          layoutId="hoverHighlight"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 rounded-xl bg-current/10 dark:bg-white/[0.08] pointer-events-none -z-0"
                          transition={SPRING_TRANSITION}
                        />
                      )}
                    </AnimatePresence>

                    <div className="relative z-10 flex items-center gap-2.5 truncate">
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm transition-transform duration-200 group-hover:scale-110 ${
                          isActive
                            ? "bg-white/20 text-white"
                            : isAi
                            ? "bg-primary/20 text-primary"
                            : "bg-muted-bg text-muted group-hover:text-text"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="relative z-10 flex items-center gap-1.5 shrink-0">
                      {isAi && !isActive && (
                        <span className="flex items-center gap-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-black text-primary">
                          <Sparkles className="h-2.5 w-2.5" /> AI
                        </span>
                      )}
                      {item.badge && (
                        <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-extrabold text-accent">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

