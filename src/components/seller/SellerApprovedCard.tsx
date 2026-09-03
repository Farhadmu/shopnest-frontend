import React from "react";
import Link from "next/link";
import { MyStore } from "@/lib/api/sellers";
import { FiCheck, FiArrowRight } from "react-icons/fi";

export interface SellerApprovedCardProps {
  store: MyStore;
}

export function SellerApprovedCard({ store }: SellerApprovedCardProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-surface to-surface p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
          <FiCheck size={32} />
        </div>
        <span className="mt-4 inline-block rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
          Verified Seller Account
        </span>
        <h1 className="mt-2 text-2xl sm:text-3xl font-black text-text">You Are Already a Seller!</h1>
        <p className="mt-2 text-sm text-muted max-w-lg mx-auto">
          Your merchant account for <strong className="text-text">{store.storeName}</strong> is verified and active. You can manage your products, track orders, and view analytics directly from your Seller Dashboard.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3 text-left">
          <div className="rounded-2xl border border-border bg-surface p-4 text-xs shadow-xs">
            <span className="text-[10px] text-muted font-bold block">TRUST SCORE</span>
            <p className="text-xl font-black text-primary mt-1">{store.trustScore ?? 85}/100</p>
            <p className="text-[10px] text-emerald-500 font-semibold">Tier 1 Verified</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 text-xs shadow-xs">
            <span className="text-[10px] text-muted font-bold block">STORE URL</span>
            <p className="font-mono font-bold text-text truncate mt-1">/store/{store.slug}</p>
            <p className="text-[10px] text-muted">Live on Marketplace</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 text-xs shadow-xs">
            <span className="text-[10px] text-muted font-bold block">SETTLEMENT</span>
            <p className="font-bold text-text capitalize mt-1">{store.businessInfo?.payoutMethod || "Active"}</p>
            <p className="text-[10px] text-emerald-500 font-semibold">Ready for payouts</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard/seller"
            className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-xs font-black text-white hover:bg-primary-hover shadow-lg shadow-primary/25 transition cursor-pointer"
          >
            Go to Seller Dashboard <FiArrowRight />
          </Link>
          <Link
            href="/dashboard/seller/products"
            className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-5 py-3.5 text-xs font-bold text-text hover:bg-muted-bg transition"
          >
            Manage Products
          </Link>
          <Link
            href={`/stores/${store.id || (store as any)._id}`}
            target="_blank"
            className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-5 py-3.5 text-xs font-bold text-muted hover:text-text hover:bg-muted-bg transition"
          >
            View Public Store
          </Link>
        </div>
      </div>
    </div>
  );
}
