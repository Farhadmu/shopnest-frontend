"use client";

import { ReactNode } from "react";
import { useDashboardGuard } from "@/hooks/dashboard/useDashboardGuard";
import { LoadingState } from "@/components/common/LoadingState";

export default function DeliveryLayout({ children }: { children: ReactNode }) {
  const { isPending, isAuthorized } = useDashboardGuard("delivery_man");

  if (isPending || !isAuthorized) return <LoadingState />;
  return <>{children}</>;
}
