"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export type DashboardRole = "admin" | "seller" | "user" | "customer";

const normalizeRole = (role?: string): "admin" | "seller" | "user" => {
  if (role === "admin") return "admin";
  if (role === "seller") return "seller";
  return "user"; // treats "customer", "user", undefined as standard customer
};

const roleHome: Record<string, string> = {
  admin: "/dashboard/admin",
  seller: "/dashboard/seller",
  user: "/dashboard/user",
  customer: "/dashboard/user",
};

/**
 * Guards a /dashboard/<role> section: redirects to /login if signed out,
 * and to the signed-in user's own section if they land on the wrong one.
 * Use in each role's layout.tsx so every page under it is protected automatically.
 */
export function useDashboardGuard(expectedRole: DashboardRole) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const actualRole = normalizeRole(userRole);
  const targetExpected = normalizeRole(expectedRole);

  const isAuthorized = !isPending && !!session?.user && actualRole === targetExpected;

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace("/login");
      return;
    }
    if (actualRole !== targetExpected) {
      router.replace(roleHome[actualRole] ?? "/dashboard/user");
    }
  }, [isPending, session, actualRole, targetExpected, router]);

  return { session, isPending, isAuthorized };
}
