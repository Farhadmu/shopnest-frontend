"use client";

import React from "react";
import { SidebarNavList } from "./SidebarNavList";
import type { DashboardLink } from "@/components/dashboard/DashboardUI";

const sampleLinks: DashboardLink[] = [
  { label: "Overview", href: "/dashboard/user", icon: "📊", description: "Shopping metrics.", group: "SHOP" },
  { label: "My Orders", href: "/dashboard/user/orders", icon: "📦", description: "Order timeline.", group: "SHOP", badge: "2" },
  { label: "AI Copilot / Advisor", href: "/dashboard/user/ai-advisor", icon: "🤖", description: "AI assistant.", group: "INSIGHTS", highlight: true },
  { label: "Spending Analytics", href: "/dashboard/user/analytics", icon: "📈", description: "Spend insights.", group: "ACTIVITY" },
  { label: "Profile & Settings", href: "/dashboard/user/profile", icon: "👤", description: "Account identity.", group: "ACCOUNT" },
];

/**
 * SidebarPreview component:
 * Demonstrates the interactive SidebarNavList with spring physics,
 * ambient pill sliding highlight (layoutId="hoverHighlight"), and translateX(5px).
 */
export function SidebarPreview() {
  return (
    <div className="w-68 rounded-2xl border border-border bg-surface p-2 shadow-xl">
      <div className="px-3 py-2 text-xs font-black uppercase tracking-wider text-muted/80 border-b border-border mb-2">
        Sidebar Preview
      </div>
      <SidebarNavList links={sampleLinks} />
    </div>
  );
}
