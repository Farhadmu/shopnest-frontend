"use client";

import { ReactNode } from "react";
import { useDashboardGuard } from "@/hooks/dashboard/useDashboardGuard";
import { LoadingState } from "@/components/common/LoadingState";
import { AiCommerceCopilot } from "@/components/ai/AiCommerceCopilot";
import { recordSession } from "@/lib/api/security-intelligence";
import { useSession } from "@/lib/auth-client";

export default function UserDashboardLayout({ children }: { children: ReactNode }) {
  const { isPending, isAuthorized } = useDashboardGuard("user");
  const { data: session } = useSession();

  if (isPending || !isAuthorized) return <LoadingState />;

  if (session?.user) {
    recordSession().catch(() => {});
  }

  return (
    <>
      {children}
      {/* Rendered once here instead of duplicated into every /dashboard/user/* page */}
      <AiCommerceCopilot role="customer" />
    </>
  );
}
