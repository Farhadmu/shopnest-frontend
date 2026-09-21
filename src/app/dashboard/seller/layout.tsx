"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useDashboardGuard } from "@/hooks/dashboard/useDashboardGuard";
import { LoadingState } from "@/components/common/LoadingState";
import { getMyStore, MyStore } from "@/lib/api/sellers";
import { FiAlertTriangle, FiArrowRight, FiClock } from "react-icons/fi";

export default function SellerLayout({ children }: { children: ReactNode }) {
  const { isPending, isAuthorized } = useDashboardGuard("seller");
  const [store, setStore] = useState<MyStore | null>(null);

  useEffect(() => {
    let isMounted = true;
    getMyStore()
      .then((res) => {
        if (!isMounted) return;
        const data = "data" in res ? (res as { data: MyStore }).data : (res as MyStore);
        if (data) setStore(data);
      })
      .catch(() => {
        if (isMounted) setStore(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isPending || !isAuthorized) return <LoadingState />;

  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      {/* ── Premium Store Suspension Compliance Bar ── */}
      {store?.status === "suspended" && (
        <div className="sticky top-0 z-40 border-b border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/40 backdrop-blur-xl px-4 py-2.5 shadow-sm transition-all">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-inner">
                <FiAlertTriangle className="h-4 w-4" />
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                <span className="rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">
                  Compliance Hold
                </span>
                <span className="font-bold text-text">
                  Store <strong className="text-rose-600 dark:text-rose-400">{store.storeName}</strong> is restricted.
                </span>
                {(store.suspensionReason || store.rejectionReason) && (
                  <span className="text-muted text-[11px] font-medium">
                    Reason: <span className="text-text font-semibold">"{store.suspensionReason || store.rejectionReason}"</span>
                  </span>
                )}
              </div>
            </div>

            <Link
              href="/become-seller"
              className="inline-flex items-center gap-1.5 self-start sm:self-center shrink-0 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-3.5 py-1.5 text-xs font-black transition shadow-sm shadow-rose-600/25"
            >
              <span>Submit Appeal Desk</span>
              <FiArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Premium Store Verification Pending Bar ── */}
      {store?.status === "pending" && (
        <div className="sticky top-0 z-40 border-b border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/40 backdrop-blur-xl px-4 py-2.5 shadow-sm transition-all">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-inner">
                <FiClock className="h-4 w-4 animate-pulse" />
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Review Pending
                </span>
                <span className="font-bold text-text">
                  Your store application for <strong className="text-primary">{store.storeName}</strong> is under administrative verification.
                </span>
              </div>
            </div>

            <Link
              href="/become-seller"
              className="inline-flex items-center gap-1.5 self-start sm:self-center shrink-0 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white px-3.5 py-1.5 text-xs font-black transition shadow-sm shadow-amber-600/25"
            >
              <span>Track Status</span>
              <FiArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      <div className="flex-1">{children}</div>
    </div>
  );
}
