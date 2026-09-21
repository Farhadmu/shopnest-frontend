"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getMyStore, MyStore } from "@/lib/api/sellers";
import {
  FiClock,
  FiAlertTriangle,
  FiCheckCircle,
  FiArrowRight,
  FiShield,
} from "react-icons/fi";
import { FaStore } from "react-icons/fa6";

export function SellerApplicationBanner() {
  const [store, setStore] = useState<MyStore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getMyStore()
      .then((res) => {
        if (!isMounted) return;
        const data = "data" in res ? (res as { data: MyStore }).data : (res as MyStore);
        if (data && data.status) {
          setStore(data);
        }
      })
      .catch(() => {
        // No store registered or not a seller applicant
        if (isMounted) setStore(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || !store || !store.status) return null;

  return (
    <AnimatePresence>
      {store.status === "pending" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-surface p-4 sm:p-5 shadow-sm backdrop-blur-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm">
                <FiClock className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-text">
                    Seller Application Under Review
                  </h4>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-amber-700 dark:text-amber-300">
                    Pending
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  Your store application for <strong className="text-text">{store.storeName}</strong> is currently being verified by our compliance team.
                </p>
              </div>
            </div>
            <Link
              href="/become-seller"
              className="inline-flex items-center gap-1.5 self-start sm:self-center shrink-0 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 px-3.5 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-200 transition"
            >
              <span>Track Application</span>
              <FiArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>
      )}

      {store.status === "rejected" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-surface p-4 sm:p-5 shadow-sm backdrop-blur-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-sm">
                <FiAlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-text">
                    Seller Application Update
                  </h4>
                  <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-rose-700 dark:text-rose-300">
                    Needs Review
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  Your application for <strong className="text-text">{store.storeName}</strong> was not approved.
                  {store.rejectionReason ? ` Reason: ${store.rejectionReason}` : " You may review and update details."}
                </p>
              </div>
            </div>
            <Link
              href="/become-seller"
              className="inline-flex items-center gap-1.5 self-start sm:self-center shrink-0 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 px-3.5 py-1.5 text-xs font-bold text-rose-800 dark:text-rose-200 transition"
            >
              <span>Review & Re-apply</span>
              <FiArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>
      )}

      {store.status === "suspended" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-500/15 via-amber-500/10 to-surface p-4 sm:p-5 shadow-sm backdrop-blur-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-sm">
                <FiShield className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-text">
                    Seller Store Suspended
                  </h4>
                  <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-rose-700 dark:text-rose-300">
                    Suspended
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  Your store <strong className="text-text">{store.storeName}</strong> has been suspended.
                  {(store.suspensionReason || store.rejectionReason) && (
                    <span className="ml-1 text-rose-600 dark:text-rose-400 font-semibold">
                      Reason: {store.suspensionReason || store.rejectionReason}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Link
              href="/become-seller"
              className="inline-flex items-center gap-1.5 self-start sm:self-center shrink-0 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 px-3.5 py-1.5 text-xs font-bold text-rose-800 dark:text-rose-200 transition"
            >
              <span>View Compliance Notice</span>
              <FiArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>
      )}

      {store.status === "approved" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-surface p-4 sm:p-5 shadow-sm backdrop-blur-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
                <FaStore className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-text">
                    Merchant Store Active
                  </h4>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-700 dark:text-emerald-300">
                    Approved
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  Your store <strong className="text-text">{store.storeName}</strong> is approved. Access your merchant tools and sales analytics.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/seller"
              className="inline-flex items-center gap-1.5 self-start sm:self-center shrink-0 rounded-xl bg-primary text-white hover:bg-primary-hover px-3.5 py-1.5 text-xs font-bold transition shadow-sm"
            >
              <span>Open Seller Dashboard</span>
              <FiArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
