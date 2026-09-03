"use client";

import React from "react";
import Link from "next/link";
import { AdminStoreRecord, StoreStatus } from "@/lib/api/sellers";
import {
  FiCheck,
  FiX,
  FiEye,
  FiPhone,
  FiMail,
  FiShield,
  FiExternalLink,
} from "react-icons/fi";
import { FaStore } from "react-icons/fa";

export interface SellerTableProps {
  stores: AdminStoreRecord[];
  onViewDetails: (store: AdminStoreRecord) => void;
  onApprove: (id: string) => void;
  onRejectPrompt: (store: AdminStoreRecord) => void;
  onSuspend: (id: string) => void;
  actionLoadingId: string | null;
}

export function SellerTable({
  stores,
  onViewDetails,
  onApprove,
  onRejectPrompt,
  onSuspend,
  actionLoadingId,
}: SellerTableProps) {
  const getStatusBadge = (status: StoreStatus) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-black text-emerald-600 dark:text-emerald-400">
            <FiCheck size={12} /> Approved
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-black text-amber-600 dark:text-amber-400 animate-pulse">
            ● Pending Review
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-black text-rose-600 dark:text-rose-400">
            <FiX size={12} /> Rejected
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-700/10 px-2.5 py-0.5 text-[11px] font-black text-rose-700">
            ⚠ Suspended
          </span>
        );
    }
  };

  return (
    <div className="grid gap-4">
      {stores.map((s) => {
        const storeId = s._id || s.id;
        const isProcessing = actionLoadingId === storeId;

        return (
          <div
            key={storeId}
            className="rounded-2xl border border-border bg-surface p-5 shadow-xs transition hover:border-primary/40 hover:shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Left Column: Store Branding & Identity */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-black text-base overflow-hidden">
                    {s.logo ? (
                      <img src={s.logo} alt={s.storeName} className="h-full w-full object-cover" />
                    ) : (
                      <FaStore />
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-text text-sm sm:text-base">{s.storeName}</h3>
                      {getStatusBadge(s.status)}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted font-mono">
                      <span>/store/{s.slug}</span>
                      <span className="text-border">·</span>
                      <span className="text-primary font-sans font-semibold">
                        {s.businessInfo?.category || "General"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Owner & Contact Details */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted pt-1">
                  {s.ownerFullName && (
                    <span className="flex items-center gap-1 font-medium text-text">
                      👤 {s.ownerFullName}
                    </span>
                  )}
                  {s.ownerEmail && (
                    <span className="flex items-center gap-1">
                      <FiMail size={12} /> {s.ownerEmail}
                    </span>
                  )}
                  {s.businessInfo?.contactPhone && (
                    <span className="flex items-center gap-1">
                      <FiPhone size={12} /> {s.businessInfo.contactPhone}
                    </span>
                  )}
                  <span className="flex items-center gap-1 font-bold text-primary">
                    <FiShield size={12} /> Trust: {s.trustScore ?? 60}/100
                  </span>
                </div>

                {s.description && (
                  <p className="text-xs text-muted line-clamp-2 max-w-2xl">{s.description}</p>
                )}

                {s.rejectionReason && (
                  <p className="text-xs text-rose-500 font-medium">
                    ⚠️ Rejection note: {s.rejectionReason}
                  </p>
                )}
              </div>

              {/* Right Column: Moderation Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onViewDetails(s)}
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-bold text-text hover:bg-muted-bg hover:border-primary/40 transition cursor-pointer"
                >
                  <FiEye size={13} /> View All Info
                </button>

                <Link
                  href={`/dashboard/admin/sellers/${storeId}`}
                  className="flex items-center gap-1 rounded-xl border border-border bg-muted-bg/30 px-3 py-2 text-xs font-medium text-muted hover:text-primary transition"
                  title="Open Dedicated Dossier Page"
                >
                  <FiExternalLink size={12} /> Page
                </Link>

                {s.status !== "approved" && (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => onApprove(storeId)}
                    className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-black text-white hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer shadow-sm shadow-emerald-600/20"
                  >
                    <FiCheck size={13} /> {isProcessing ? "..." : "Approve"}
                  </button>
                )}

                {s.status !== "rejected" && (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => onRejectPrompt(s)}
                    className="flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-500 hover:text-white transition disabled:opacity-50 cursor-pointer"
                  >
                    <FiX size={13} /> Reject
                  </button>
                )}

                {s.status === "approved" && (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => onSuspend(storeId)}
                    className="flex items-center gap-1 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-muted hover:text-rose-600 hover:border-rose-500/40 transition disabled:opacity-50 cursor-pointer"
                  >
                    Suspend
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
