"use client";

import React, { useState } from "react";
import { updateMyStore, MyStore } from "@/lib/api/sellers";
import { StoreSettingsHeader } from "./StoreSettingsHeader";
import { StoreOverviewCard } from "./StoreOverviewCard";
import { StoreProfileSettings } from "./StoreProfileSettings";
import { BusinessKycSettings } from "./BusinessKycSettings";
import { PayoutSettings } from "./PayoutSettings";
import { FaStore } from "react-icons/fa";
import { FiShield, FiCreditCard, FiCheck, FiSave, FiEye, FiEdit3, FiArrowLeft } from "react-icons/fi";

export interface StoreSettingsClientProps {
  initialStore: MyStore | null;
}

export function StoreSettingsClient({ initialStore }: StoreSettingsClientProps) {
  const [store, setStore] = useState<MyStore | null>(initialStore);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "kyc" | "payout" | "preview">("profile");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    storeName: initialStore?.storeName || "",
    category: initialStore?.businessInfo?.category || "Electronics & Gadgets",
    description: initialStore?.description || "",
    logo: initialStore?.logo || "",
    banner: initialStore?.banner || "",

    // KYC & Business
    ownerName: initialStore?.businessInfo?.ownerName || "",
    contactPhone: initialStore?.businessInfo?.contactPhone || "",
    contactEmail: (initialStore as any)?.contactEmail || "",
    businessAddress: initialStore?.businessInfo?.businessAddress || "",
    nidOrTradeLicense: initialStore?.businessInfo?.nidOrTradeLicense || "",
    taxId: initialStore?.businessInfo?.taxId || "",

    // Payout
    payoutMethod: initialStore?.businessInfo?.payoutMethod || "bank",
    payoutAccountName: initialStore?.businessInfo?.payoutAccountName || "",
    payoutAccountNumber: initialStore?.businessInfo?.payoutAccountNumber || "",
    bankBranch: initialStore?.businessInfo?.bankBranch || "",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload = {
      storeName: form.storeName.trim(),
      description: form.description.trim(),
      logo: form.logo.trim() || undefined,
      banner: form.banner.trim() || undefined,
      businessInfo: {
        ownerName: form.ownerName.trim() || undefined,
        contactPhone: form.contactPhone.trim() || undefined,
        businessAddress: form.businessAddress.trim() || undefined,
        nidOrTradeLicense: form.nidOrTradeLicense.trim() || undefined,
        taxId: form.taxId.trim() || undefined,
        category: form.category,
        payoutMethod: form.payoutMethod,
        payoutAccountName: form.payoutAccountName.trim() || undefined,
        payoutAccountNumber: form.payoutAccountNumber.trim() || undefined,
        bankBranch: form.bankBranch.trim() || undefined,
      },
    };

    try {
      const updatedRes = await updateMyStore(payload);
      const updatedStore = (updatedRes as any)?.data ?? updatedRes;
      setStore(updatedStore);
      setIsEditing(false);
      setSuccess("Store settings updated successfully!");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update store settings.");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Store Identity", icon: FaStore },
    { id: "kyc", label: "Legal & KYC", icon: FiShield },
    { id: "payout", label: "Payout Channel", icon: FiCreditCard },
    { id: "preview", label: "Live Card Preview", icon: FiEye },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <StoreSettingsHeader
        store={{
          ...(store || {}),
          storeName: form.storeName || store?.storeName || "",
          logo: form.logo || store?.logo,
          banner: form.banner || store?.banner,
          businessInfo: { category: form.category || store?.businessInfo?.category },
        }}
      />

      {/* Success & Error Feedback Alerts */}
      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-bold text-rose-600 dark:text-rose-400">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
          <FiCheck size={16} /> {success}
        </div>
      )}

      {/* MODE 1: READ-ONLY OVERVIEW (Default View) */}
      {!isEditing ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-3xl border border-border bg-surface p-4 sm:p-6 shadow-xs">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">Overview Mode</span>
              <h2 className="text-sm font-black text-text">Store Details Summary</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab("profile");
                setIsEditing(true);
              }}
              className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-black text-white hover:bg-primary-hover shadow-lg shadow-primary/25 transition cursor-pointer"
            >
              <FiEdit3 size={14} /> Edit Store Settings
            </button>
          </div>

          <StoreOverviewCard
            store={
              store || {
                storeName: form.storeName,
                slug: "my-store",
                description: form.description,
                logo: form.logo,
                banner: form.banner,
                businessInfo: {
                  ownerName: form.ownerName,
                  contactPhone: form.contactPhone,
                  contactEmail: form.contactEmail,
                  businessAddress: form.businessAddress,
                  nidOrTradeLicense: form.nidOrTradeLicense,
                  taxId: form.taxId,
                  category: form.category,
                  payoutMethod: form.payoutMethod,
                  payoutAccountName: form.payoutAccountName,
                  payoutAccountNumber: form.payoutAccountNumber,
                  bankBranch: form.bankBranch,
                },
              }
            }
            onEditSection={(tab) => {
              setActiveTab(tab);
              setIsEditing(true);
            }}
          />
        </div>
      ) : (
        /* MODE 2: EDITABLE FORM MODE */
        <form onSubmit={handleSave} className="space-y-6">
          {/* Top Bar with Back CTA and Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-2 text-xs font-bold text-muted hover:text-text hover:bg-muted-bg transition cursor-pointer"
            >
              <FiArrowLeft size={14} /> Back to Overview
            </button>

            <div className="flex flex-wrap items-center gap-1.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-extrabold transition cursor-pointer ${
                      isActive
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "bg-surface text-muted hover:bg-muted-bg hover:text-text border border-border"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-2 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <FiSave size={14} />
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>

          {/* Editable Panels */}
          {activeTab === "profile" && (
            <StoreProfileSettings
              form={form}
              onChange={(updated) => setForm((prev) => ({ ...prev, ...updated }))}
            />
          )}

          {activeTab === "kyc" && (
            <BusinessKycSettings
              form={form}
              onChange={(updated) => setForm((prev) => ({ ...prev, ...updated }))}
            />
          )}

          {activeTab === "payout" && (
            <PayoutSettings
              form={form}
              onChange={(updated) => setForm((prev) => ({ ...prev, ...updated }))}
            />
          )}

          {activeTab === "preview" && (
            <div className="rounded-3xl border border-border bg-surface p-8 text-center space-y-4 shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary text-2xl font-black">
                {form.logo ? (
                  <img src={form.logo} alt="Store Logo" className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  <FaStore />
                )}
              </div>
              <div>
                <h3 className="text-xl font-black text-text">{form.storeName || "Store Name"}</h3>
                <p className="text-xs text-primary font-bold">Category: {form.category}</p>
                <p className="text-xs text-muted max-w-md mx-auto mt-2 leading-relaxed">
                  {form.description || "No store description provided yet."}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 text-left max-w-lg mx-auto text-xs pt-4 border-t border-border">
                <div className="rounded-xl border border-border bg-muted-bg/30 p-3">
                  <span className="text-[10px] font-bold text-muted block">Legal Owner</span>
                  <span className="font-bold text-text">{form.ownerName || "Not provided"}</span>
                </div>
                <div className="rounded-xl border border-border bg-muted-bg/30 p-3">
                  <span className="text-[10px] font-bold text-muted block">Contact Phone</span>
                  <span className="font-bold text-text">{form.contactPhone || "Not provided"}</span>
                </div>
                <div className="rounded-xl border border-border bg-muted-bg/30 p-3">
                  <span className="text-[10px] font-bold text-muted block">Payout Method</span>
                  <span className="font-bold text-text uppercase">{form.payoutMethod}</span>
                </div>
                <div className="rounded-xl border border-border bg-muted-bg/30 p-3">
                  <span className="text-[10px] font-bold text-muted block">Payout Account</span>
                  <span className="font-mono font-bold text-text">{form.payoutAccountNumber || "Not provided"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Sticky Action Footer */}
          <div className="flex items-center justify-between rounded-3xl border border-border bg-surface p-6 shadow-md">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-2xl border border-border px-5 py-3 text-xs font-bold text-text hover:bg-muted-bg transition cursor-pointer"
            >
              Cancel Editing
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3.5 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              <FiSave size={16} />
              <span>{saving ? "Saving Changes..." : "Save Store Settings"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
