"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

const roleHome: Record<string, string> = {
  admin: "/dashboard/admin",
  seller: "/dashboard/seller",
  customer: "/dashboard/user",
  user: "/dashboard/user",
};

/** /dashboard has no UI of its own — it just forwards to /dashboard/<role>. */
export default function DashboardIndex() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace("/login");
      return;
    }
    const role = (session.user as { role?: string }).role || "user";
    router.replace(roleHome[role] || "/dashboard/user");
  }, [isPending, session, router]);

  return null;
}
