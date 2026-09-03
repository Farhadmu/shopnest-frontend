"use client";

import React from "react";
import { FiCreditCard, FiCheck } from "react-icons/fi";

const PAYOUT_METHODS = [
  { id: "bank", label: "Bank Transfer", icon: "🏦", desc: "Direct EFT / BEFTN settlement" },
  { id: "bkash", label: "bKash Merchant", icon: "📱", desc: "Instant mobile wallet disbursement" },
  { id: "nagad", label: "Nagad Account", icon: "📲", desc: "Mobile financial service" },
  { id: "rocket", label: "DBBL Rocket", icon: "🚀", desc: "Rocket wallet payout" },
];

export interface PayoutFormData {
  payoutMethod: string;
  payoutAccountName: string;
  payoutAccountNumber: string;
  bankBranch: string;
}

export interface PayoutSettingsProps {
  form: PayoutFormData;
  onChange: (updated: Partial<PayoutFormData>) => void;
}

export function PayoutSettings({ form, onChange }: PayoutSettingsProps) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
          <FiCreditCard size={18} />
        </div>
        <div>
          <h2 className="text-base font-black text-text">Financial Payout & Settlement Channel</h2>
          <p className="text-xs text-muted">Configure weekly sales revenue disbursement bank account or mobile wallet.</p>
        </div>
      </div>

      {/* Payout Method Selection Cards */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-text">Select Settlement Channel</label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PAYOUT_METHODS.map((m) => {
            const isSelected = form.payoutMethod === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onChange({ payoutMethod: m.id })}
                className={`relative flex flex-col justify-between rounded-2xl p-4 text-left transition cursor-pointer ${
                  isSelected
                    ? "border-2 border-emerald-500 bg-emerald-500/10 shadow-sm"
                    : "border border-border bg-surface hover:bg-muted-bg/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{m.icon}</span>
                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px]">
                      <FiCheck size={12} />
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <p className="font-extrabold text-xs text-text">{m.label}</p>
                  <p className="text-[10px] text-muted leading-tight mt-0.5">{m.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Account Details */}
      <div className="grid gap-4 sm:grid-cols-2 pt-2">
        <div>
          <label htmlFor="payoutAccountNameInput" className="block text-xs font-bold text-text mb-1.5">
            Account Holder / Beneficiary Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="payoutAccountNameInput"
            type="text"
            value={form.payoutAccountName}
            onChange={(e) => onChange({ payoutAccountName: e.target.value })}
            placeholder="Official name on bank account or wallet"
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            required
          />
        </div>

        <div>
          <label htmlFor="payoutAccountNumberInput" className="block text-xs font-bold text-text mb-1.5">
            Account Number / Mobile Wallet Number <span className="text-rose-500">*</span>
          </label>
          <input
            id="payoutAccountNumberInput"
            type="text"
            value={form.payoutAccountNumber}
            onChange={(e) => onChange({ payoutAccountNumber: e.target.value })}
            placeholder="e.g. 150XXXXXXXXXX or 017XXXXXXXX"
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition font-mono"
            required
          />
        </div>

        {form.payoutMethod === "bank" && (
          <div className="sm:col-span-2">
            <label htmlFor="bankBranchInput" className="block text-xs font-bold text-text mb-1.5">
              Bank Name & Branch Details
            </label>
            <input
              id="bankBranchInput"
              type="text"
              value={form.bankBranch}
              onChange={(e) => onChange({ bankBranch: e.target.value })}
              placeholder="e.g. Dutch-Bangla Bank Ltd, Gulshan 1 Branch, Dhaka"
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>
        )}
      </div>
    </div>
  );
}
