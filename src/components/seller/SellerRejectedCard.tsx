import React from "react";
import Link from "next/link";
import { MyStore } from "@/lib/api/sellers";
import { FiAlertTriangle, FiEdit3 } from "react-icons/fi";

export interface SellerRejectedCardProps {
  store: MyStore;
  onEdit: () => void;
}

export function SellerRejectedCard({ store, onEdit }: SellerRejectedCardProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-surface to-surface p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/30">
          <FiAlertTriangle size={32} />
        </div>
        <span className="mt-4 inline-block rounded-full bg-rose-500/15 px-3 py-1 text-xs font-black uppercase text-rose-600 dark:text-rose-400">
          Application Needs Correction
        </span>
        <h1 className="mt-2 text-2xl font-black text-text">Seller Application Not Approved</h1>

        {store.rejectionReason && (
          <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs font-medium text-rose-600 dark:text-rose-400 text-left">
            <p className="font-bold mb-1">Feedback from Admin Reviewer:</p>
            <p>{store.rejectionReason}</p>
          </div>
        )}

        <p className="mt-4 text-xs text-muted leading-relaxed">
          Please review the feedback above, update your store information or KYC documents, and resubmit your application for re-verification.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-black text-white hover:bg-primary-hover shadow-lg shadow-primary/25 transition cursor-pointer"
          >
            <FiEdit3 /> Update & Re-submit Application
          </button>
          <Link
            href="/support"
            className="rounded-2xl border border-border bg-surface px-6 py-3 text-xs font-bold text-text hover:bg-muted-bg transition"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
