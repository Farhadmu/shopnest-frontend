import React from "react";
import { MyStore } from "@/lib/api/sellers";
import { FiClock } from "react-icons/fi";
import { SellerPendingTimeline } from "./SellerPendingTimeline";
import { SellerPendingDossier } from "./SellerPendingDossier";

export interface SellerPendingViewProps {
  store: MyStore;
  onRefresh: () => void;
  onEdit: () => void;
}

export function SellerPendingView({ store, onRefresh, onEdit }: SellerPendingViewProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
          <FiClock className="animate-spin" /> Application Under Review
        </span>
        <h1 className="mt-3 text-2xl font-black text-text">Seller Verification in Progress</h1>
        <p className="mt-1 text-sm text-muted">
          Our Trust & Safety team is reviewing your documentation. Estimated review turnaround:{" "}
          <strong>24–48 hours</strong>.
        </p>
      </div>

      <SellerPendingTimeline />
      <SellerPendingDossier store={store} onRefresh={onRefresh} onEdit={onEdit} />
    </div>
  );
}
