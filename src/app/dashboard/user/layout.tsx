"use client";

import { ReactNode } from "react";
import { useDashboardGuard } from "@/hooks/dashboard/useDashboardGuard";
import { LoadingState } from "@/components/common/LoadingState";
import { AiCommerceCopilot } from "@/components/ai/AiCommerceCopilot";

export default function UserDashboardLayout({ children }: { children: ReactNode }) {
  const { isPending, isAuthorized } = useDashboardGuard("user");

  if (isPending || !isAuthorized) return <LoadingState />;
  return (
    <>
      {children}
      {/* Rendered once here instead of duplicated into every /dashboard/user/* page */}
      <AiCommerceCopilot role="customer" />
    </>
  );
}
