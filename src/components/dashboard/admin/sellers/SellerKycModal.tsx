"use client";

import React, { useEffect } from "react";
import { AdminSellerFullDetails, StoreStatus } from "@/lib/api/sellers";
import { SellerFullDossier } from "./SellerFullDossier";

export interface SellerKycModalProps {
  seller: AdminSellerFullDetails | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onRejectPrompt: (seller: AdminSellerFullDetails) => void;
  onSuspend: (id: string) => void;
  isProcessing: boolean;
}

export function SellerKycModal({
  seller,
  onClose,
  onApprove,
  onRejectPrompt,
  onSuspend,
  isProcessing,
}: SellerKycModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (seller) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [seller, onClose]);

  if (!seller) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-xl bg-muted-bg text-muted hover:text-text transition cursor-pointer z-10"
        >
          ✕
        </button>

        <SellerFullDossier
          seller={seller}
          onApprove={onApprove}
          onRejectPrompt={onRejectPrompt}
          onSuspend={onSuspend}
          isProcessing={isProcessing}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
