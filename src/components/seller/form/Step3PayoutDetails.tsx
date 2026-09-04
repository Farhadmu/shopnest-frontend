// frontend/src/components/seller/form/Step3PayoutDetails.tsx
"use client";

import React from "react";
import { PAYOUT_METHODS } from "@/lib/constants/seller-application";
import { StepProps } from "@/types/seller-application";

export function Step3PayoutDetails({ formData, onChange }: StepProps) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-black text-text">3. Payout & Financial Settlement</h2>
        <p className="text-[11px] text-muted">Configure how you will receive automated disbursements from sales.</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {PAYOUT_METHODS.map((pm) => {
          const isSelected = formData.payoutMethod === pm.id;
          return (
            <button
              type="button"
              key={pm.id}
              onClick={() => onChange("payoutMethod", pm.id)}
              className={`flex items-start gap-2 rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-xs"
                  : "border-border hover:border-muted bg-surface"
              }`}
            >
              <span className="text-xl shrink-0">{pm.icon}</span>
              <div>
                <p className="text-xs font-black text-text">{pm.label}</p>
                <p className="text-[10px] text-muted leading-tight mt-0.5">{pm.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-text">
            Beneficiary Name <span className="text-error">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. John Doe / Apex Corp"
            value={formData.payoutAccountName}
            onChange={(e) => onChange("payoutAccountName", e.target.value)}
            required
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-text">
            {formData.payoutMethod === "bank" ? "Bank Account No." : "Wallet No."}{" "}
            <span className="text-error">*</span>
          </label>
          <input
            type="text"
            placeholder={formData.payoutMethod === "bank" ? "13-16 digit account number" : "017XXXXXXXX"}
            value={formData.payoutAccountNumber}
            onChange={(e) => onChange("payoutAccountNumber", e.target.value)}
            required
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>
      </div>

      {formData.payoutMethod === "bank" && (
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-text">Bank & Branch Name</label>
          <input
            type="text"
            placeholder="e.g. City Bank - Gulshan Branch"
            value={formData.bankBranch}
            onChange={(e) => onChange("bankBranch", e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>
      )}
    </div>
  );
}

