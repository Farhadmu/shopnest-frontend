"use client";

import React from "react";
import Link from "next/link";
import { AdminStoreRecord, StoreStatus, resolveCategoryTitle } from "@/lib/api/sellers";
import {
  FiCheck,
  FiX,
  FiEye,
  FiPhone,
  FiMail,
  FiShield,
  FiExternalLink,
  FiAlertTriangle,
  FiClock,
  FiUser,
  FiArrowRight,
} from "react-icons/fi";
import { FaStore } from "react-icons/fa";

export interface SellerTableProps {
  stores: AdminStoreRecord[];
  onViewDetails: (store: AdminStoreRecord) => void;
  onApprove: (id: string) => void;
  onRejectPrompt: (store: AdminStoreRecord) => void;
  onSuspendPrompt: (store: AdminStoreRecord) => void;
  actionLoadingId: string | null;
}

export function SellerTable({
  stores,
  onViewDetails,
  onApprove,
  onRejectPrompt,
  onSuspendPrompt,
  actionLoadingId,
}: SellerTableProps) {
  const getStatusBadge = (status: StoreStatus) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-3 py-0.5 text-[11px] font-black text-emerald-600 dark:text-emerald-400">
            <FiCheck size={12} /> Active & Verified
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 px-3 py-0.5 text-[11px] font-black text-amber-600 dark:text-amber-400 animate-pulse">
            <FiClock size={12} /> Pending KYC Review
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 px-3 py-0.5 text-[11px] font-black text-rose-600 dark:text-rose-400">
            <FiX size={12} /> Rejected
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-700/10 border border-rose-700/30 px-3 py-0.5 text-[11px] font-black text-rose-700 dark:text-rose-400">
            <FiAlertTriangle size={12} /> Suspended
          </span>
        );
    }
  };

  const getTrustBadgeClass = (score: number = 60) => {
    if (score >= 80) return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    if (score >= 50) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    return "bg-rose-500/10 text-rose-600 border-rose-500/20";
  };

  return (
    <div className="grid gap-4">
      {stores.map((s) => {
        const storeId = s._id || s.id;
        const isProcessing = actionLoadingId === storeId;
        const hasAppeal = s.status === "suspended" && Boolean(s.appeal?.reason);

        return (
          <div
            key={storeId}
            className={`rounded-3xl border bg-surface p-5 sm:p-6 shadow-xs transition-all hover:shadow-md ${
              hasAppeal
                ? "border-primary/40 bg-gradient-to-br from-primary/5 via-surface to-surface shadow-primary/5"
                : s.status === "suspended"
                ? "border-rose-500/30"
                : s.status === "pending"
                ? "border-amber-500/30"
                : "border-border hover:border-primary/30"
            }`}
          >
            <div className="flex flex-col gap-5">
              {/* TOP HEADER ROW: Branding, Title, Badges & Top Actions */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary text-2xl font-black shrink-0 overflow-hidden border border-primary/20 shadow-inner">
                    {s.logo ? (
                      <img src={s.logo} alt={s.storeName} className="h-full w-full object-cover" />
                    ) : (
                      <FaStore />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-text text-base sm:text-lg tracking-tight">
                        {s.storeName}
                      </h3>
                      {getStatusBadge(s.status)}
                      {hasAppeal && (
                        <span className="rounded-full bg-primary text-white text-[10px] font-black uppercase px-2.5 py-0.5 tracking-wider shadow-xs animate-bounce">
                          📬 Action Required
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted mt-0.5">
                      <span className="font-mono text-[11px] text-primary font-bold">/store/{s.slug}</span>
                      <span className="text-border">·</span>
                      <span className="rounded-md bg-muted-bg px-2 py-0.5 text-[10px] font-bold uppercase text-muted">
                        {resolveCategoryTitle(s.businessInfo?.categoryId, "General")}
                      </span>
                      <span className="text-border">·</span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-black ${getTrustBadgeClass(
                          s.trustScore
                        )}`}
                      >
                        <FiShield size={11} /> Trust: {s.trustScore ?? 60}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button Cluster */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => onViewDetails(s)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-bold text-text hover:bg-muted-bg hover:border-primary/40 transition cursor-pointer shadow-xs active:scale-95"
                  >
                    <FiEye size={13} className="text-primary" /> Inspect Dossier
                  </button>

                  <Link
                    href={`/dashboard/admin/sellers/${storeId}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-border bg-muted-bg/40 px-3 py-2 text-xs font-medium text-muted hover:text-primary transition"
                    title="Open Dedicated Fullscreen Dossier"
                  >
                    <FiExternalLink size={12} /> Full Page
                  </Link>

                  {s.status === "pending" && (
                    <>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => onApprove(storeId)}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer shadow-sm shadow-emerald-600/20 active:scale-95"
                      >
                        <FiCheck size={13} /> {isProcessing ? "..." : "Approve Store"}
                      </button>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => onRejectPrompt(s)}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-500 hover:text-white transition disabled:opacity-50 cursor-pointer active:scale-95"
                      >
                        <FiX size={13} /> Reject
                      </button>
                    </>
                  )}

                  {s.status === "approved" && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => onSuspendPrompt(s)}
                      className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-bold text-muted hover:text-rose-600 hover:border-rose-500/40 transition disabled:opacity-50 cursor-pointer active:scale-95"
                    >
                      <FiAlertTriangle size={12} /> Suspend Store
                    </button>
                  )}
                </div>
              </div>

              {/* DEDICATED APPEAL ACTION DESK (When Seller has submitted an Appeal) */}
              {hasAppeal && (
                <div className="rounded-2xl border border-primary/30 bg-surface p-4 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-white text-xs">
                        📬
                      </span>
                      <span className="text-xs font-black text-text">Compliance Appeal Desk</span>
                      <span className="text-[11px] text-muted">
                        Submitted: {s.appeal?.submittedAt ? new Date(s.appeal.submittedAt).toLocaleString() : "Recently"}
                      </span>
                    </div>
                    {s.appeal?.email && (
                      <span className="text-[11px] font-mono text-muted bg-muted-bg px-2.5 py-0.5 rounded-md">
                        Email: {s.appeal.email}
                      </span>
                    )}
                  </div>

                  {/* Side-by-Side Comparison Grid */}
                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                      <span className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400 block mb-1">
                        🚨 Prior Suspension Reason
                      </span>
                      <p className="text-xs text-text font-medium leading-relaxed">
                        "{s.suspensionReason || s.rejectionReason || "Platform compliance review"}"
                      </p>
                    </div>

                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                      <span className="text-[10px] font-bold uppercase text-primary block mb-1">
                        ✍️ Merchant's Appeal & Corrective Actions
                      </span>
                      <p className="text-xs text-text font-semibold leading-relaxed">
                        "{s.appeal?.reason}"
                      </p>
                    </div>
                  </div>

                  {/* Instant 1-Click Appeal Decision Controls */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    <span className="text-xs text-muted mr-auto font-medium hidden sm:inline">
                      Review completed? Choose decision:
                    </span>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => onSuspendPrompt(s)}
                      className="rounded-xl border border-border px-3.5 py-1.5 text-xs font-bold text-muted hover:text-rose-600 hover:border-rose-500/30 transition cursor-pointer"
                    >
                      Maintain Suspension & Update Note
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => onApprove(storeId)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 text-xs font-black shadow-sm shadow-emerald-600/25 transition cursor-pointer active:scale-95"
                    >
                      <FiCheck size={13} /> Accept Appeal & Reinstate Store
                    </button>
                  </div>
                </div>
              )}

              {/* NON-APPEAL SUSPENSION NOTICE */}
              {!hasAppeal && s.status === "suspended" && (s.suspensionReason || s.rejectionReason) && (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FiAlertTriangle className="text-rose-600 shrink-0" size={14} />
                    <span className="text-muted">
                      Suspension Reason: <strong className="text-text">{s.suspensionReason || s.rejectionReason}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] text-muted font-bold shrink-0">Awaiting Merchant Appeal</span>
                </div>
              )}

              {/* FOOTER ROW: Merchant Owner Details & Meta */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted pt-1">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  {s.ownerFullName && (
                    <span className="flex items-center gap-1.5 font-semibold text-text">
                      <FiUser size={13} className="text-muted" /> {s.ownerFullName}
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
                </div>

                <div className="text-[11px] text-muted font-mono">
                  Applied: {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "Recent"}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
