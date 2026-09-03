import React from "react";
import Link from "next/link";
import { MyStore } from "@/lib/api/sellers";
import { FiCheck, FiClock, FiAlertTriangle, FiExternalLink, FiShield } from "react-icons/fi";
import { FaStore } from "react-icons/fa";

export interface StoreSettingsHeaderProps {
  store: Partial<MyStore> & {
    storeName: string;
    slug?: string;
    logo?: string;
    banner?: string;
    status?: string;
    trustScore?: number;
    businessInfo?: {
      category?: string;
    };
  };
}

export function StoreSettingsHeader({ store }: StoreSettingsHeaderProps) {
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
            <FiCheck size={12} /> Active Verified Store
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-black text-amber-600 dark:text-amber-400 animate-pulse">
            <FiClock size={12} /> Pending Verification
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 px-3 py-1 text-xs font-black text-rose-600 dark:text-rose-400">
            <FiAlertTriangle size={12} /> Rejection Review Needed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-black text-primary">
            Store Profile
          </span>
        );
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface via-surface to-primary/5 p-6 sm:p-8 shadow-sm">
      {/* Banner Preview Background */}
      {store.banner ? (
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <img src={store.banner} alt="Banner" className="h-full w-full object-cover" />
        </div>
      ) : null}

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-white text-2xl font-black shadow-lg shadow-primary/25 overflow-hidden ring-4 ring-surface">
            {store.logo ? (
              <img src={store.logo} alt={store.storeName} className="h-full w-full object-cover" />
            ) : (
              <FaStore />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-text">
                {store.storeName || "My Merchant Store"}
              </h1>
              {getStatusBadge(store.status)}
            </div>
            <p className="text-xs text-muted font-mono flex items-center gap-1">
              <span>/store/{store.slug || "slug-preview"}</span>
              {store.id && (
                <Link
                  href={`/stores/${store.id}`}
                  target="_blank"
                  className="text-primary hover:underline ml-1 inline-flex items-center gap-1 font-sans font-bold"
                >
                  <FiExternalLink size={11} /> Live Preview
                </Link>
              )}
            </p>
            <p className="text-xs text-muted">
              <strong className="text-text">Category:</strong> {store.businessInfo?.category || "General Marketplace"}
            </p>
          </div>
        </div>

        {/* Quick Metrics Cards */}
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-xs p-3.5 min-w-[100px] text-center shadow-xs">
            <span className="text-[10px] text-muted font-bold flex items-center justify-center gap-1">
              <FiShield size={10} className="text-primary" /> TRUST SCORE
            </span>
            <span className="text-xl font-black text-primary block mt-0.5">{store.trustScore ?? 75}/100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
