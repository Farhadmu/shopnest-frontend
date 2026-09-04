// frontend/src/components/seller/form/Step4ReviewSubmit.tsx
"use client";

import React from "react";
import { StepProps } from "@/types/seller-application";

export function Step4ReviewSubmit({ formData, onChange }: StepProps) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-black text-text">4. Application Summary & Agreement</h2>
        <p className="text-[11px] text-muted">
          Review your application before submitting to the ShopNest verification team.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-muted-bg/50 p-2.5 text-[11px] space-y-1">
          <span className="text-[9px] font-extrabold uppercase text-primary">Store Info</span>
          <p className="font-black text-text truncate">{formData.storeName || "N/A"}</p>
          <p className="text-muted truncate">{formData.category}</p>
          <p className="text-muted line-clamp-1">{formData.description || "N/A"}</p>
        </div>

        <div className="rounded-xl border border-border bg-muted-bg/50 p-2.5 text-[11px] space-y-1">
          <span className="text-[9px] font-extrabold uppercase text-primary">KYC & Owner</span>
          <p className="font-black text-text truncate">{formData.ownerName || "N/A"}</p>
          <p className="text-muted truncate">{formData.contactPhone || "N/A"}</p>
          <p className="text-muted truncate">NID: {formData.nidOrTradeLicense || "N/A"}</p>
        </div>

        <div className="rounded-xl border border-border bg-muted-bg/50 p-2.5 text-[11px] space-y-1">
          <span className="text-[9px] font-extrabold uppercase text-primary">Payout Channel</span>
          <p className="font-black text-text uppercase truncate">{formData.payoutMethod}</p>
          <p className="text-muted truncate">{formData.payoutAccountName || "N/A"}</p>
          <p className="text-muted font-mono truncate">{formData.payoutAccountNumber || "N/A"}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border p-3 bg-surface">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.agreedToTerms}
            onChange={(e) => onChange("agreedToTerms", e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-[11px] text-muted leading-tight">
            I certify that all information provided is accurate and authentic. I agree to comply with the{" "}
            <strong className="text-text">ShopNest Seller Code of Conduct</strong> and fulfillment SLA.
          </span>
        </label>
      </div>
    </div>
  );
}

