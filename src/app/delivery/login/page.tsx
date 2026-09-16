"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DeliveryLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login?role=delivery_man&next=/dashboard/delivery");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-background">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-muted">Redirecting to Delivery Partner Login...</p>
      </div>
    </div>
  );
}
