import { ReactNode } from "react";

/**
 * Parent of /dashboard/admin, /dashboard/seller, /dashboard/user.
 * The actual auth + role guard lives in each role's own layout.tsx
 * (via useDashboardGuard), because "am I allowed here" depends on
 * *which* role folder we're in — this parent doesn't know that yet.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
