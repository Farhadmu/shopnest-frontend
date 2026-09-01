"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebarLayout } from "@/components/dashboard/DashboardLayout";

/**
 * Parent layout for /dashboard, /dashboard/user, /dashboard/seller, /dashboard/admin.
 * Provides the persistent desktop sidebar & mobile navigation drawer across all dashboard pages.
 * Role authorization guards and copilot plugins are maintained in each role's layout.tsx.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Root redirect page doesn't need sidebar during redirect
  if (pathname === "/dashboard") {
    return <>{children}</>;
  }

  return <DashboardSidebarLayout>{children}</DashboardSidebarLayout>;
}

