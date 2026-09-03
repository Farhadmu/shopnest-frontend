"use client";

import React from "react";
import Link from "next/link";
import { AdminSellerFullDetails, StoreStatus } from "@/lib/api/sellers";
import {
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCreditCard,
  FiShield,
  FiPackage,
  FiShoppingBag,
  FiDollarSign,
  FiCalendar,
  FiExternalLink,
  FiUser,
  FiTag,
  FiClock,
} from "react-icons/fi";
import { FaStore } from "react-icons/fa";

export interface SellerFullDossierProps {
  seller: AdminSellerFullDetails;
  onApprove?: (id: string) => void;
  onRejectPrompt?: (seller: AdminSellerFullDetails) => void;
  onSuspend?: (id: string) => void;
  isProcessing?: boolean;
  onClose?: () => void;
  isStandalonePage?: boolean;
}

export function SellerFullDossier({
  seller,
  onApprove,
  onRejectPrompt,
  onSuspend,
  isProcessing = false,
  onClose,
  isStandalonePage = false,
}: SellerFullDossierProps) {
  const storeId = seller._id || seller.id;

  const getStatusBadge = (status: StoreStatus) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
            ✓ Verified Partner
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-600 dark:text-amber-400 animate-pulse">
            ● Pending Review
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-black text-rose-600 dark:text-rose-400">
            ✕ Application Rejected
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-700/10 px-3 py-1 text-xs font-black text-rose-700">
            ⚠ Store Suspended
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Core Identity */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-surface to-surface p-6 sm:p-8 shadow-sm">
        {seller.banner && (
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <img src={seller.banner} alt="Store Banner" className="h-full w-full object-cover" />
          </div>
        )}

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-white text-2xl font-black shadow-lg shadow-primary/25 overflow-hidden">
              {seller.logo ? (
                <img src={seller.logo} alt={seller.storeName} className="h-full w-full object-cover" />
              ) : (
                <FaStore />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-text">{seller.storeName}</h1>
                {getStatusBadge(seller.status)}
              </div>
              <p className="text-xs text-muted font-mono flex items-center gap-1">
                <span>URL: /store/{seller.slug}</span>
                <Link
                  href={`/stores/${storeId}`}
                  target="_blank"
                  className="text-primary hover:underline ml-1 inline-flex items-center gap-1"
                >
                  <FiExternalLink size={11} /> View Public Page
                </Link>
              </p>
              <p className="text-xs text-muted">
                <strong className="text-text">Category:</strong> {seller.businessInfo?.category || "General Marketplace"}
              </p>
            </div>
          </div>

          {/* Quick Metrics Badge Group */}
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-xs p-3 min-w-[90px] text-center shadow-xs">
              <span className="text-[10px] text-muted font-bold block">TRUST SCORE</span>
              <span className="text-lg font-black text-primary">{seller.trustScore ?? 60}/100</span>
            </div>
            <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-xs p-3 min-w-[90px] text-center shadow-xs">
              <span className="text-[10px] text-muted font-bold block">PRODUCTS</span>
              <span className="text-lg font-black text-text">{seller.metrics?.totalProducts ?? 0}</span>
            </div>
            <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-xs p-3 min-w-[90px] text-center shadow-xs">
              <span className="text-[10px] text-muted font-bold block">SALES</span>
              <span className="text-lg font-black text-emerald-600">
                ৳{(seller.metrics?.totalSales ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert if rejected or suspended */}
      {seller.rejectionReason && (
        <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-4 text-xs">
          <p className="font-bold text-rose-600 dark:text-rose-400 mb-0.5">⚠️ Rejection Feedback Recorded:</p>
          <p className="text-text">{seller.rejectionReason}</p>
        </div>
      )}

      {/* 2-Column Main Dossier Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* SECTION 1: LEGAL OWNER & USER IDENTITY */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FiUser />
            </span>
            <div>
              <h3 className="text-sm font-black text-text">Legal Owner & Identity</h3>
              <p className="text-[11px] text-muted">Merchant personal details and account credentials</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-xl border border-border bg-muted-bg/20 p-3">
              <span className="text-muted block text-[10px] font-bold">Legal Full Name</span>
              <p className="font-bold text-text mt-0.5">{seller.businessInfo?.ownerName || "Not provided"}</p>
            </div>

            <div className="rounded-xl border border-border bg-muted-bg/20 p-3">
              <span className="text-muted block text-[10px] font-bold">Account User Name</span>
              <p className="font-bold text-text mt-0.5">{seller.ownerFullName || "Not linked"}</p>
            </div>

            <div className="rounded-xl border border-border bg-muted-bg/20 p-3">
              <span className="text-muted block text-[10px] font-bold">Contact Phone Number</span>
              <p className="font-bold text-text mt-0.5">{seller.businessInfo?.contactPhone || "Not provided"}</p>
            </div>

            <div className="rounded-xl border border-border bg-muted-bg/20 p-3">
              <span className="text-muted block text-[10px] font-bold">Account Email</span>
              <p className="font-bold text-text mt-0.5 truncate">{seller.ownerEmail || "Not provided"}</p>
            </div>

            <div className="rounded-xl border border-border bg-muted-bg/20 p-3 sm:col-span-2">
              <span className="text-muted block text-[10px] font-bold">Physical Business / Warehouse Address</span>
              <p className="font-medium text-text mt-0.5">{seller.businessInfo?.businessAddress || "Not provided"}</p>
            </div>

            <div className="rounded-xl border border-border bg-muted-bg/20 p-3">
              <span className="text-muted block text-[10px] font-bold">User Account ID</span>
              <p className="font-mono text-[11px] text-muted truncate mt-0.5">{seller.ownerId}</p>
            </div>

            <div className="rounded-xl border border-border bg-muted-bg/20 p-3">
              <span className="text-muted block text-[10px] font-bold">System Role</span>
              <p className="font-bold text-primary mt-0.5 uppercase">{seller.ownerRole || "customer"}</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: KYC & REGULATORY DOCUMENTS */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <FiShield />
            </span>
            <div>
              <h3 className="text-sm font-black text-text">KYC & Regulatory Documents</h3>
              <p className="text-[11px] text-muted">Government ID, trade license & tax compliance</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-xl border border-border bg-muted-bg/20 p-3 sm:col-span-2">
              <span className="text-muted block text-[10px] font-bold">National ID (NID) / Trade License Number</span>
              <p className="font-mono text-sm font-black text-primary mt-1">
                {seller.businessInfo?.nidOrTradeLicense || "None on record"}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted-bg/20 p-3">
              <span className="text-muted block text-[10px] font-bold">Tax ID / e-TIN Registration</span>
              <p className="font-mono font-bold text-text mt-0.5">{seller.businessInfo?.taxId || "Not Registered"}</p>
            </div>

            <div className="rounded-xl border border-border bg-muted-bg/20 p-3">
              <span className="text-muted block text-[10px] font-bold">Store Category</span>
              <p className="font-bold text-text mt-0.5">{seller.businessInfo?.category || "General"}</p>
            </div>

            <div className="rounded-xl border border-border bg-muted-bg/20 p-3">
              <span className="text-muted block text-[10px] font-bold">Verification Date</span>
              <p className="text-text mt-0.5">
                {seller.verifiedAt ? new Date(seller.verifiedAt).toLocaleDateString() : "Not Yet Verified"}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted-bg/20 p-3">
              <span className="text-muted block text-[10px] font-bold">Verified By Admin</span>
              <p className="font-mono text-[11px] text-muted mt-0.5 truncate">{seller.verifiedBy || "Pending"}</p>
            </div>
          </div>
        </div>

        {/* SECTION 3: PAYOUT & BANKING SETTLEMENT */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <FiCreditCard />
            </span>
            <div>
              <h3 className="text-sm font-black text-text">Payout & Settlement Channel</h3>
              <p className="text-[11px] text-muted">Bank or mobile wallet disbursement destination</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-xl border border-border bg-muted-bg/20 p-3">
              <span className="text-muted block text-[10px] font-bold">Disbursement Method</span>
              <p className="font-black text-text uppercase mt-0.5">{seller.businessInfo?.payoutMethod || "Bank"}</p>
            </div>

            <div className="rounded-xl border border-border bg-muted-bg/20 p-3">
              <span className="text-muted block text-[10px] font-bold">Beneficiary / Account Name</span>
              <p className="font-bold text-text mt-0.5">{seller.businessInfo?.payoutAccountName || "Not Provided"}</p>
            </div>

            <div className="rounded-xl border border-border bg-muted-bg/20 p-3 sm:col-span-2">
              <span className="text-muted block text-[10px] font-bold">Account / Wallet Number</span>
              <p className="font-mono text-sm font-black text-text mt-0.5">
                {seller.businessInfo?.payoutAccountNumber || "Not Provided"}
              </p>
            </div>

            {seller.businessInfo?.bankBranch && (
              <div className="rounded-xl border border-border bg-muted-bg/20 p-3 sm:col-span-2">
                <span className="text-muted block text-[10px] font-bold">Bank Name & Branch</span>
                <p className="font-bold text-text mt-0.5">{seller.businessInfo.bankBranch}</p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: STORE DESCRIPTION & AUDIT DATES */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <FiClock />
            </span>
            <div>
              <h3 className="text-sm font-black text-text">Store Description & Timestamps</h3>
              <p className="text-[11px] text-muted">Store profile bio and audit lifecycle timestamps</p>
            </div>
          </div>

          <div>
            <span className="text-muted block text-[10px] font-bold mb-1">Store Description</span>
            <p className="rounded-xl border border-border bg-muted-bg/20 p-3.5 text-xs text-text leading-relaxed">
              {seller.description || "No store description provided."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div className="rounded-xl border border-border bg-muted-bg/20 p-3">
              <span className="text-muted block text-[10px] font-bold">Registered / Applied Date</span>
              <p className="text-text mt-0.5">
                {seller.createdAt ? new Date(seller.createdAt).toLocaleString() : "Unknown"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted-bg/20 p-3">
              <span className="text-muted block text-[10px] font-bold">Last Profile Update</span>
              <p className="text-text mt-0.5">
                {seller.updatedAt ? new Date(seller.updatedAt).toLocaleString() : "Unknown"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: RECENT PRODUCTS PREVIEW (IF AVAILABLE) */}
      {seller.recentProducts && seller.recentProducts.length > 0 && (
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FiPackage />
              </span>
              <h3 className="text-sm font-black text-text">
                Recent Listed Products ({seller.metrics?.totalProducts ?? seller.recentProducts.length})
              </h3>
            </div>
            <Link
              href={`/dashboard/admin/products?sellerId=${storeId}`}
              className="text-xs font-bold text-primary hover:underline"
            >
              View in Catalog Moderation →
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {seller.recentProducts.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border bg-muted-bg/20 p-3 text-xs space-y-1">
                <div className="flex items-center gap-2">
                  {p.images && p.images[0] ? (
                    <img src={p.images[0]} alt={p.title} className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-muted-bg flex items-center justify-center text-muted">
                      📦
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="font-bold text-text truncate">{p.title}</p>
                    <p className="text-primary font-black">৳{p.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted pt-1 border-t border-border">
                  <span>Stock: {p.stock ?? 0}</span>
                  <span className="capitalize">{p.status || "active"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTION TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-surface p-6 shadow-md">
        <div>
          <span className="text-[10px] font-extrabold uppercase text-muted block">Moderation Controls</span>
          <p className="text-xs text-text font-bold">Change store status and sync seller privileges</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-border bg-surface px-5 py-2.5 text-xs font-bold text-text hover:bg-muted-bg transition cursor-pointer"
            >
              Close Dossier
            </button>
          )}

          {seller.status !== "rejected" && onRejectPrompt && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onRejectPrompt(seller)}
              className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-500 hover:text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              ✕ Reject Application
            </button>
          )}

          {seller.status === "approved" && onSuspend && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onSuspend(storeId)}
              className="rounded-2xl border border-border bg-surface px-5 py-2.5 text-xs font-bold text-muted hover:text-rose-600 hover:border-rose-500/40 transition disabled:opacity-50 cursor-pointer"
            >
              ⚠ Suspend Store
            </button>
          )}

          {seller.status !== "approved" && onApprove && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onApprove(storeId)}
              className="rounded-2xl bg-emerald-600 px-7 py-2.5 text-xs font-black text-white hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              ✓ Approve & Activate Store
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
