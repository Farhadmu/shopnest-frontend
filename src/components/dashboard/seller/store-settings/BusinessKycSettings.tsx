"use client";

import React from "react";
import { FiShield, FiUser, FiPhone, FiMail, FiMapPin, FiFileText } from "react-icons/fi";

export interface BusinessKycFormData {
  ownerName: string;
  contactPhone: string;
  contactEmail: string;
  businessAddress: string;
  nidOrTradeLicense: string;
  taxId: string;
}

export interface BusinessKycSettingsProps {
  form: BusinessKycFormData;
  onChange: (updated: Partial<BusinessKycFormData>) => void;
}

export function BusinessKycSettings({ form, onChange }: BusinessKycSettingsProps) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
          <FiShield size={18} />
        </div>
        <div>
          <h2 className="text-base font-black text-text">Legal & Business Verification (KYC)</h2>
          <p className="text-xs text-muted">Legal owner details, official business contacts, and government registration documents.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Legal Owner Name */}
        <div>
          <label htmlFor="ownerNameInput" className="block text-xs font-bold text-text mb-1.5 flex items-center gap-1">
            <FiUser size={13} /> Legal Owner Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="ownerNameInput"
            type="text"
            value={form.ownerName}
            onChange={(e) => onChange({ ownerName: e.target.value })}
            placeholder="Official name printed on NID / Passport"
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            required
          />
        </div>

        {/* Contact Phone */}
        <div>
          <label htmlFor="contactPhoneInput" className="block text-xs font-bold text-text mb-1.5 flex items-center gap-1">
            <FiPhone size={13} /> Contact Telephone Number <span className="text-rose-500">*</span>
          </label>
          <input
            id="contactPhoneInput"
            type="tel"
            value={form.contactPhone}
            onChange={(e) => onChange({ contactPhone: e.target.value })}
            placeholder="+880 17XX-XXXXXX"
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            required
          />
        </div>

        {/* Contact Email */}
        <div>
          <label htmlFor="contactEmailInput" className="block text-xs font-bold text-text mb-1.5 flex items-center gap-1">
            <FiMail size={13} /> Official Business Email
          </label>
          <input
            id="contactEmailInput"
            type="email"
            value={form.contactEmail}
            onChange={(e) => onChange({ contactEmail: e.target.value })}
            placeholder="merchant@yourdomain.com"
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>

        {/* NID / Trade License */}
        <div>
          <label htmlFor="nidInput" className="block text-xs font-bold text-text mb-1.5 flex items-center gap-1">
            <FiFileText size={13} /> NID or Trade License No. <span className="text-rose-500">*</span>
          </label>
          <input
            id="nidInput"
            type="text"
            value={form.nidOrTradeLicense}
            onChange={(e) => onChange({ nidOrTradeLicense: e.target.value })}
            placeholder="10 or 17 digit NID / License No."
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition font-mono"
            required
          />
        </div>

        {/* Tax ID / e-TIN */}
        <div>
          <label htmlFor="taxIdInput" className="block text-xs font-bold text-text mb-1.5 flex items-center gap-1">
            <FiFileText size={13} /> Tax ID / e-TIN (Optional)
          </label>
          <input
            id="taxIdInput"
            type="text"
            value={form.taxId}
            onChange={(e) => onChange({ taxId: e.target.value })}
            placeholder="12-digit e-TIN number"
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition font-mono"
          />
        </div>

        {/* Physical Address */}
        <div className="sm:col-span-2">
          <label htmlFor="addressInput" className="block text-xs font-bold text-text mb-1.5 flex items-center gap-1">
            <FiMapPin size={13} /> Business & Warehouse Address <span className="text-rose-500">*</span>
          </label>
          <input
            id="addressInput"
            type="text"
            value={form.businessAddress}
            onChange={(e) => onChange({ businessAddress: e.target.value })}
            placeholder="Holding No, Road, Ward, Thana, District"
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            required
          />
        </div>
      </div>
    </div>
  );
}
