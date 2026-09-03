"use client";

import React from "react";
import Link from "next/link";
import { MyStore } from "@/lib/api/sellers";
import {
  FiEdit3,
  FiShield,
  FiCreditCard,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiFileText,
  FiExternalLink,
} from "react-icons/fi";
import { FaStore } from "react-icons/fa";

export interface StoreOverviewCardProps {
  store: Partial<MyStore> & {
    storeName: string;
    slug?: string;
    description?: string;
    logo?: string;
    banner?: string;
    businessInfo?: any;
    trustScore?: number;
  };
  onEditSection: (tab: "profile" | "kyc" | "payout") => void;
}

export function StoreOverviewCard({ store, onEditSection }: StoreOverviewCardProps) {
  const info = store.businessInfo || {};

  return (
    <div className="space-y-6">
      {/* SECTION 1: STORE BRANDING & PROFILE OVERVIEW */}
      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FaStore size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-text">Store Profile & Branding Overview</h2>
              <p className="text-xs text-muted">Public store name, category, brand bio, and media assets.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEditSection("profile")}
            className="flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2 text-xs font-black text-white hover:bg-primary-hover shadow-md shadow-primary/20 transition cursor-pointer"
          >
            <FiEdit3 size={13} /> Edit Profile & Branding
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Logo & Banner Preview Thumbnails */}
          <div className="space-y-3 lg:border-r lg:border-border lg:pr-6">
            <div>
              <span className="text-[10px] font-bold uppercase text-muted block mb-1">Store Logo</span>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-muted-bg/30 text-primary font-black overflow-hidden shadow-xs">
                {store.logo ? (
                  <img src={store.logo} alt={store.storeName} className="h-full w-full object-cover" />
                ) : (
                  <FaStore size={24} />
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-muted block mb-1">Hero Banner</span>
              <div className="h-20 w-full rounded-2xl border border-border bg-muted-bg/30 overflow-hidden relative">
                {store.banner ? (
                  <img src={store.banner} alt="Banner" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[10px] text-muted">
                    No Banner Uploaded
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-2xl border border-border bg-muted-bg/20 p-3.5">
                <span className="text-[10px] font-bold text-muted block">Store Name</span>
                <span className="font-bold text-text text-sm mt-0.5 block">{store.storeName || "Not Set"}</span>
              </div>

              <div className="rounded-2xl border border-border bg-muted-bg/20 p-3.5">
                <span className="text-[10px] font-bold text-muted block">Primary Category</span>
                <span className="font-bold text-primary text-xs mt-0.5 block">{info.category || "General Marketplace"}</span>
              </div>

              <div className="rounded-2xl border border-border bg-muted-bg/20 p-3.5 sm:col-span-2">
                <span className="text-[10px] font-bold text-muted block">Public Store URL</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-mono font-bold text-text">/stores/{store.slug || "slug"}</span>
                  {store.id && (
                    <Link
                      href={`/stores/${store.id}`}
                      target="_blank"
                      className="text-primary hover:underline text-[11px] font-bold flex items-center gap-1"
                    >
                      <FiExternalLink size={11} /> Visit Store Page
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-muted block mb-1">Store Description / Bio</span>
              <p className="rounded-2xl border border-border bg-muted-bg/20 p-4 text-xs text-text leading-relaxed">
                {store.description || "No store description set yet."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: LEGAL & BUSINESS KYC OVERVIEW */}
      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <FiShield size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-text">Legal & Business Verification (KYC) Overview</h2>
              <p className="text-xs text-muted">Legal owner details, official contacts, and government registration documents.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEditSection("kyc")}
            className="flex items-center gap-1.5 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500 hover:text-white transition cursor-pointer"
          >
            <FiEdit3 size={13} /> Edit Legal & KYC
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
          <div className="rounded-2xl border border-border bg-muted-bg/20 p-3.5">
            <span className="text-[10px] font-bold text-muted flex items-center gap-1">
              <FiUser size={11} /> Legal Owner Name
            </span>
            <span className="font-bold text-text mt-1 block">{info.ownerName || "Not Provided"}</span>
          </div>

          <div className="rounded-2xl border border-border bg-muted-bg/20 p-3.5">
            <span className="text-[10px] font-bold text-muted flex items-center gap-1">
              <FiPhone size={11} /> Contact Phone Number
            </span>
            <span className="font-bold text-text mt-1 block">{info.contactPhone || "Not Provided"}</span>
          </div>

          <div className="rounded-2xl border border-border bg-muted-bg/20 p-3.5">
            <span className="text-[10px] font-bold text-muted flex items-center gap-1">
              <FiMail size={11} /> Official Email Address
            </span>
            <span className="font-bold text-text mt-1 block truncate">
              {info.contactEmail || (store as any).contactEmail || "Not Provided"}
            </span>
          </div>

          <div className="rounded-2xl border border-border bg-muted-bg/20 p-3.5">
            <span className="text-[10px] font-bold text-muted flex items-center gap-1">
              <FiFileText size={11} /> NID / Trade License No.
            </span>
            <span className="font-mono font-black text-primary mt-1 block">
              {info.nidOrTradeLicense || "Not Provided"}
            </span>
          </div>

          <div className="rounded-2xl border border-border bg-muted-bg/20 p-3.5">
            <span className="text-[10px] font-bold text-muted flex items-center gap-1">
              <FiFileText size={11} /> Tax ID / e-TIN
            </span>
            <span className="font-mono font-bold text-text mt-1 block">{info.taxId || "Not Registered"}</span>
          </div>

          <div className="rounded-2xl border border-border bg-muted-bg/20 p-3.5 lg:col-span-3">
            <span className="text-[10px] font-bold text-muted flex items-center gap-1">
              <FiMapPin size={11} /> Business & Warehouse Physical Address
            </span>
            <span className="font-medium text-text mt-1 block">{info.businessAddress || "Not Provided"}</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: FINANCIAL PAYOUT CHANNEL OVERVIEW */}
      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <FiCreditCard size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-text">Payout & Settlement Channel Overview</h2>
              <p className="text-xs text-muted">Weekly sales revenue disbursement channel and beneficiary account.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEditSection("payout")}
            className="flex items-center gap-1.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition cursor-pointer"
          >
            <FiEdit3 size={13} /> Edit Payout Method
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div className="rounded-2xl border border-border bg-muted-bg/20 p-3.5">
            <span className="text-[10px] font-bold text-muted block">Disbursement Channel</span>
            <span className="font-black text-text uppercase text-sm mt-1 block">{info.payoutMethod || "Bank"}</span>
          </div>

          <div className="rounded-2xl border border-border bg-muted-bg/20 p-3.5">
            <span className="text-[10px] font-bold text-muted block">Account Holder Name</span>
            <span className="font-bold text-text mt-1 block">{info.payoutAccountName || "Not Provided"}</span>
          </div>

          <div className="rounded-2xl border border-border bg-muted-bg/20 p-3.5 sm:col-span-2">
            <span className="text-[10px] font-bold text-muted block">Account / Mobile Wallet Number</span>
            <span className="font-mono font-black text-text text-sm mt-1 block">
              {info.payoutAccountNumber || "Not Provided"}
            </span>
          </div>

          {info.bankBranch && (
            <div className="rounded-2xl border border-border bg-muted-bg/20 p-3.5 sm:col-span-4">
              <span className="text-[10px] font-bold text-muted block">Bank Name & Branch Details</span>
              <span className="font-bold text-text mt-1 block">{info.bankBranch}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
