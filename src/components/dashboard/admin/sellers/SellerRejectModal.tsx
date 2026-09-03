"use client";

import React, { useState } from "react";
import { AdminStoreRecord } from "@/lib/api/sellers";

const REJECTION_PRESETS = [
  "Incomplete or unreadable NID / Trade License documentation",
  "Business contact phone could not be verified",
  "Discrepancy between legal business name and payout account details",
  "Prohibited or restricted product categories",
  "Insufficient store information or misleading identity",
  "Warehouse / business address is invalid or unverifiable",
];

export interface SellerRejectModalProps {
  store: AdminStoreRecord | null;
  onClose: () => void;
  onConfirmReject: (id: string, reason: string) => void;
  isProcessing: boolean;
}

export function SellerRejectModal({
  store,
  onClose,
  onConfirmReject,
  isProcessing,
}: SellerRejectModalProps) {
  const [reason, setReason] = useState("");

  if (!store) return null;

  const storeId = store._id || store.id;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase text-rose-600 dark:text-rose-400">
            Action Required
          </span>
          <h3 className="text-lg font-black text-text">Reject Seller Application</h3>
          <p className="text-xs text-muted mt-0.5">
            Provide feedback for <strong className="text-text">{store.storeName}</strong> so they know what corrections to make before re-submitting.
          </p>
        </div>

        {/* Preset reasons */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-muted uppercase">Quick Feedback Presets</span>
          <div className="flex flex-wrap gap-1.5">
            {REJECTION_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setReason(preset)}
                className="rounded-lg border border-border bg-muted-bg/30 px-2.5 py-1 text-[11px] text-muted hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition text-left cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="rejectionReason" className="block text-xs font-bold text-text mb-1">
            Custom Feedback / Rejection Reason Note <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="rejectionReason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain specifically why this application cannot be approved..."
            className="w-full rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-text hover:bg-muted-bg cursor-pointer transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!reason.trim() || isProcessing}
            onClick={() => onConfirmReject(storeId, reason.trim())}
            className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer shadow-md shadow-rose-600/20 transition"
          >
            {isProcessing ? "Rejecting..." : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
}
