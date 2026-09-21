"use client";

import React, { useState } from "react";
import { AdminStoreRecord } from "@/lib/api/sellers";
import { ShieldAlert, AlertTriangle, X } from "lucide-react";

const SUSPENSION_PRESETS = [
  "Policy Violation: Prohibited or counterfeit products detected",
  "High Customer Dispute Rate: Unresolved buyer complaints or refund delays",
  "KYC Invalidation: Discrepancy in Trade License, NID, or payout banking details",
  "Fulfillment Failure: Repetitive delayed deliveries or cancelled orders",
  "Suspicious Account Activity: Potential fraud or unauthorized access risk",
  "Compliance Audit: Routine marketplace quality and safety review",
];

export interface SellerSuspendModalProps {
  store: AdminStoreRecord | null;
  onClose: () => void;
  onConfirmSuspend: (id: string, reason: string) => void;
  isProcessing: boolean;
}

export function SellerSuspendModal({
  store,
  onClose,
  onConfirmSuspend,
  isProcessing,
}: SellerSuspendModalProps) {
  const [reason, setReason] = useState("");

  if (!store) return null;

  const storeId = store._id || store.id;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-3xl border border-rose-500/30 bg-surface p-6 shadow-2xl space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted hover:bg-muted-bg hover:text-text transition"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 border border-rose-500/30">
            <ShieldAlert size={20} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <AlertTriangle size={12} /> Merchant Compliance Action
            </span>
            <h3 className="text-lg font-black text-text">Suspend Seller Store</h3>
            <p className="text-xs text-muted mt-0.5">
              Specify the reason for suspending <strong className="text-text">{store.storeName}</strong>. This note will be sent directly to the seller to guide their appeal.
            </p>
          </div>
        </div>

        {/* Preset reasons */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-muted uppercase">Select Compliance Preset</span>
          <div className="flex flex-wrap gap-1.5">
            {SUSPENSION_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setReason(preset)}
                className={`rounded-xl border px-2.5 py-1 text-[11px] text-left transition cursor-pointer ${
                  reason === preset
                    ? "border-rose-500 bg-rose-500/10 text-rose-600 font-bold"
                    : "border-border bg-muted-bg/30 text-muted hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/40"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="suspensionReason" className="block text-xs font-bold text-text mb-1">
            Suspension Reason / Note to Merchant <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="suspensionReason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain specifically why this store is being suspended and what remedies are expected..."
            className="w-full rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text placeholder:text-muted focus:border-rose-500 focus:outline-none"
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
            onClick={() => onConfirmSuspend(storeId, reason.trim())}
            className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer shadow-md shadow-rose-600/20 transition inline-flex items-center gap-1.5"
          >
            <ShieldAlert size={14} />
            {isProcessing ? "Suspending..." : "Confirm Suspension"}
          </button>
        </div>
      </div>
    </div>
  );
}
