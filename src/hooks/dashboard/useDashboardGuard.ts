"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getDeliveryProfile } from "@/lib/api/delivery";

export type DashboardRole = "admin" | "seller" | "user" | "customer" | "delivery_man" | "delivery";

const normalizeRole = (role?: string): "admin" | "seller" | "user" | "delivery_man" => {
  if (role === "admin") return "admin";
  if (role === "seller") return "seller";
  if (role === "delivery_man" || role === "delivery") return "delivery_man";
  return "user"; // treats "customer", "user", undefined as standard customer
};

const roleHome: Record<string, string> = {
  admin: "/dashboard/admin",
  seller: "/dashboard/seller",
  user: "/dashboard/user",
  customer: "/dashboard/user",
  delivery_man: "/dashboard/delivery",
  delivery: "/dashboard/delivery",
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

  const [deliveryStatusChecking, setDeliveryStatusChecking] = useState(
    targetExpected === "delivery_man" && actualRole !== "delivery_man"
  );
  const [isDeliveryApproved, setIsDeliveryApproved] = useState(
    actualRole === "delivery_man"
  );

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace("/login");
      return;
    }

    if (targetExpected === "delivery_man") {
      if (actualRole === "delivery_man") {
        setIsDeliveryApproved(true);
        setDeliveryStatusChecking(false);
        return;
      }

      // Check real delivery profile status from backend
      setDeliveryStatusChecking(true);
      getDeliveryProfile()
        .then((res) => {
          const profileData = "data" in res ? (res as any).data : res;
          const status = profileData?.profile?.status;
          if (status === "approved") {
            setIsDeliveryApproved(true);
          } else if (status === "pending_verification") {
            router.replace("/delivery/pending");
          } else if (status === "rejected" || status === "suspended") {
            router.replace("/delivery/pending");
          } else {
            router.replace("/delivery/register");
          }
        })
        .catch(() => {
          router.replace("/dashboard/user");
        })
        .finally(() => {
          setDeliveryStatusChecking(false);
        });
      return;
    }

    if (actualRole !== targetExpected) {
      router.replace(roleHome[actualRole] ?? "/dashboard/user");
    }
  }, [isPending, session, actualRole, targetExpected, router]);

  const isAuthorized =
    !isPending &&
    !deliveryStatusChecking &&
    !!session?.user &&
    (targetExpected === "delivery_man" ? isDeliveryApproved : actualRole === targetExpected);

  return { session, isPending: isPending || deliveryStatusChecking, isAuthorized };
}
