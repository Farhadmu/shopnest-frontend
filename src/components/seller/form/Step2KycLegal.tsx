// frontend/src/components/seller/form/Step2KycLegal.tsx
"use client";

import React from "react";
import { FiInfo } from "react-icons/fi";
import { StepProps } from "@/types/seller-application";

export function Step2KycLegal({ formData, onChange }: StepProps) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-black text-text">2. Legal & Business Verification (KYC)</h2>
        <p className="text-[11px] text-muted">
          Mandatory verification to keep our marketplace trustworthy and fraud-free.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-text">
            Legal Owner Full Name <span className="text-error">*</span>
          </label>
          <input
            type="text"
            placeholder="As printed on NID / Passport"
            value={formData.ownerName}
            onChange={(e) => onChange("ownerName", e.target.value)}
            required
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-text">
            Official Contact Phone <span className="text-error">*</span>
          </label>
          <input
            type="number"
            minLength={11}
            placeholder="e.g. +880 1712 345678"
            value={formData.contactPhone}
            onChange={(e) => onChange("contactPhone", e.target.value)}
            required
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-[11px] font-bold text-text">
          Business / Warehouse Address <span className="text-error">*</span>
        </label>
        <input
          type="text"
          placeholder="House, Road, Area, City, Postal Code"
          value={formData.businessAddress}
          onChange={(e) => onChange("businessAddress", e.target.value)}
          required
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-text">
            NID / Trade License No. <span className="text-error">*</span>
          </label>
          <input
            type="text"
            placeholder="NID or Trade License No."
            value={formData.nidOrTradeLicense}
            onChange={(e) => onChange("nidOrTradeLicense", e.target.value)}
            required
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-text">TIN / Tax ID No.</label>
          <input
            type="text"
            placeholder="12-digit e-TIN (if registered)"
            value={formData.taxId}
            onChange={(e) => onChange("taxId", e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 p-2.5 text-[11px] text-primary">
        <FiInfo className="shrink-0 text-sm" />
        <span>Your business information is strictly encrypted and used solely for identity verification.</span>
      </div>
    </div>
  );
}


