"use client";

import { useState } from "react";
import { registerStore, updateMyStore, RegisterStoreInput, MyStore } from "@/lib/api/sellers";
import {
  FiCheckCircle,
  FiShield,
  FiCreditCard,
  FiFileText,
  FiArrowRight,
  FiArrowLeft,
  FiAlertCircle,
  FiInfo,
} from "react-icons/fi";
import { FaStore } from "react-icons/fa";

export interface SellerApplicationFormProps {
  initialData?: MyStore | null;
  isResubmission?: boolean;
  onSuccess?: (store: MyStore) => void;
}

const CATEGORIES = [
  "Electronics & Gadgets",
  "Fashion & Apparel",
  "Home & Living",
  "Health & Beauty",
  "Groceries & Essentials",
  "Sports & Outdoors",
  "Books & Stationery",
  "Automotive & Tools",
  "Toys & Baby Care",
  "Other / Multi-Category",
];

const PAYOUT_METHODS = [
  { id: "bank", label: "Bank Account Transfer", icon: "🏦", desc: "Direct BEFTN / NPSB transfer to your commercial bank" },
  { id: "bkash", label: "bKash Merchant / Personal", icon: "📱", desc: "Instant mobile wallet disbursement" },
  { id: "nagad", label: "Nagad Wallet", icon: "💳", desc: "Postal service digital financial payout" },
  { id: "rocket", label: "DBBL Rocket", icon: "🚀", desc: "Direct Rocket wallet settlement" },
];

export function SellerApplicationForm({ initialData, isResubmission = false, onSuccess }: SellerApplicationFormProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Store Profile
  const [storeName, setStoreName] = useState(initialData?.storeName || "");
  const [category, setCategory] = useState(initialData?.businessInfo?.category || CATEGORIES[0]);
  const [description, setDescription] = useState(initialData?.description || "");
  const [logo, setLogo] = useState(initialData?.logo || "");
  const [banner, setBanner] = useState(initialData?.banner || "");

  // Step 2: Legal & KYC
  const [ownerName, setOwnerName] = useState(initialData?.businessInfo?.ownerName || "");
  const [contactPhone, setContactPhone] = useState(initialData?.businessInfo?.contactPhone || "");
  const [businessAddress, setBusinessAddress] = useState(initialData?.businessInfo?.businessAddress || "");
  const [nidOrTradeLicense, setNidOrTradeLicense] = useState(initialData?.businessInfo?.nidOrTradeLicense || "");
  const [taxId, setTaxId] = useState(initialData?.businessInfo?.taxId || "");

  // Step 3: Payout & Settlement
  const [payoutMethod, setPayoutMethod] = useState(initialData?.businessInfo?.payoutMethod || "bank");
  const [payoutAccountName, setPayoutAccountName] = useState(initialData?.businessInfo?.payoutAccountName || "");
  const [payoutAccountNumber, setPayoutAccountNumber] = useState(initialData?.businessInfo?.payoutAccountNumber || "");
  const [bankBranch, setBankBranch] = useState(initialData?.businessInfo?.bankBranch || "");

  // Step 4: Agreement
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const slugPreview = storeName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const validateStep1 = () => {
    if (storeName.trim().length < 2) {
      setError("Store name must be at least 2 characters.");
      return false;
    }
    if (description.trim().length < 10) {
      setError("Store description must be at least 10 characters.");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep2 = () => {
    if (ownerName.trim().length < 2) {
      setError("Legal owner full name is required for verification.");
      return false;
    }
    if (contactPhone.trim().length < 6) {
      setError("Valid official contact phone is required.");
      return false;
    }
    if (businessAddress.trim().length < 5) {
      setError("Business or warehouse address is required.");
      return false;
    }
    if (!nidOrTradeLicense.trim()) {
      setError("NID or Trade License number is required for store identity verification.");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep3 = () => {
    if (!payoutAccountNumber.trim()) {
      setError("Payout account/wallet number is required to receive earnings.");
      return false;
    }
    if (!payoutAccountName.trim()) {
      setError("Account holder name is required.");
      return false;
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    setError("");
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) setStep(4);
  };

  const handleBack = () => {
    setError("");
    if (step > 1) setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError("You must agree to the ShopNest Merchant Policy & Terms to proceed.");
      return;
    }

    const payload: RegisterStoreInput = {
      storeName: storeName.trim(),
      description: description.trim(),
      logo: logo.trim() || undefined,
      banner: banner.trim() || undefined,
      businessInfo: {
        ownerName: ownerName.trim(),
        contactPhone: contactPhone.trim(),
        businessAddress: businessAddress.trim(),
        nidOrTradeLicense: nidOrTradeLicense.trim(),
        taxId: taxId.trim() || undefined,
        category,
        payoutMethod,
        payoutAccountName: payoutAccountName.trim(),
        payoutAccountNumber: payoutAccountNumber.trim(),
        bankBranch: bankBranch.trim() || undefined,
      },
      resubmit: isResubmission,
    };

    setLoading(true);
    setError("");

    try {
      let storeRes: any;
      if (initialData?.status === "rejected" || initialData?.status === "pending") {
        storeRes = await updateMyStore({ ...payload, resubmit: true });
      } else {
        storeRes = await registerStore(payload);
      }
      const actualStore: MyStore = storeRes?.data ?? storeRes;
      onSuccess?.({ ...actualStore, status: "pending" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none transition";
  const labelClass = "block text-xs font-bold text-text mb-1.5";

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 shadow-xl sm:p-8">
      {/* Step Navigation Progress */}
      <div className="mb-8">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {[
            { num: 1, label: "Store Profile", icon: FaStore },
            { num: 2, label: "KYC & Business", icon: FiShield },
            { num: 3, label: "Payout Details", icon: FiCreditCard },
            { num: 4, label: "Review & Submit", icon: FiFileText },
          ].map((s) => {
            const Icon = s.icon;
            const isDone = step > s.num;
            const isCurrent = step === s.num;

            return (
              <div
                key={s.num}
                onClick={() => {
                  if (s.num < step) setStep(s.num as any);
                }}
                className={`flex flex-col items-center gap-1.5 rounded-2xl p-2.5 transition ${
                  isCurrent
                    ? "bg-primary/10 text-primary font-black"
                    : isDone
                    ? "text-emerald-500 font-bold cursor-pointer hover:bg-muted-bg"
                    : "text-muted font-medium"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs transition ${
                    isCurrent
                      ? "bg-primary text-white shadow-md shadow-primary/30"
                      : isDone
                      ? "bg-emerald-500 text-white"
                      : "bg-muted-bg text-muted"
                  }`}
                >
                  {isDone ? <FiCheckCircle size={14} /> : <Icon size={14} />}
                </div>
                <span className="text-[11px] hidden sm:inline">{s.label}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted-bg">
          <div
            className="h-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-xs font-medium text-rose-600 dark:text-rose-400">
          <FiAlertCircle className="mt-0.5 shrink-0" size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: STORE PROFILE */}
      {step === 1 && (
        <div className="space-y-5 animate-in fade-in">
          <div>
            <h2 className="text-base font-black text-text">1. Store Branding & Identity</h2>
            <p className="text-xs text-muted">Tell customers who you are and establish your brand on ShopNest.</p>
          </div>

          <div>
            <label htmlFor="storeName" className={labelClass}>
              Store Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="storeName"
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. Apex Electronics, Dhaka Craft Haven"
              className={inputClass}
              required
            />
            {slugPreview && (
              <p className="mt-1.5 text-[11px] text-muted flex items-center gap-1">
                <span>Store URL:</span>
                <code className="font-mono text-primary font-bold">shopnest.com/store/{slugPreview}</code>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="category" className={labelClass}>
              Primary Product Category <span className="text-rose-500">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Store Bio & Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Introduce your business, products, quality guarantees, and dispatch turnaround time..."
              rows={4}
              className={inputClass}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="logo" className={labelClass}>
                Store Logo URL (Optional)
              </label>
              <input
                id="logo"
                type="url"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="banner" className={labelClass}>
                Store Banner URL (Optional)
              </label>
              <input
                id="banner"
                type="url"
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: KYC & LEGAL */}
      {step === 2 && (
        <div className="space-y-5 animate-in fade-in">
          <div>
            <h2 className="text-base font-black text-text">2. Legal & Business Verification (KYC)</h2>
            <p className="text-xs text-muted">Mandatory verification to keep our marketplace trustworthy and fraud-free.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ownerName" className={labelClass}>
                Legal Owner Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="ownerName"
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="As printed on NID / Passport"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="contactPhone" className={labelClass}>
                Official Contact Phone <span className="text-rose-500">*</span>
              </label>
              <input
                id="contactPhone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g. +880 1712 345678"
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="businessAddress" className={labelClass}>
              Business / Warehouse Address <span className="text-rose-500">*</span>
            </label>
            <input
              id="businessAddress"
              type="text"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              placeholder="House, Road, Area, City, Postal Code"
              className={inputClass}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="nidOrTradeLicense" className={labelClass}>
                National ID (NID) / Trade License No. <span className="text-rose-500">*</span>
              </label>
              <input
                id="nidOrTradeLicense"
                type="text"
                value={nidOrTradeLicense}
                onChange={(e) => setNidOrTradeLicense(e.target.value)}
                placeholder="10/13/17 digit NID or Trade License No."
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="taxId" className={labelClass}>
                TIN / Tax Identification No. (Optional)
              </label>
              <input
                id="taxId"
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="12-digit e-TIN (if registered)"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-indigo-500/10 p-4 text-[11px] text-indigo-600 dark:text-indigo-400">
            <FiInfo className="shrink-0" size={16} />
            <span>Your business information is strictly encrypted and used solely for trust & safety verification.</span>
          </div>
        </div>
      )}

      {/* STEP 3: PAYOUT DETAILS */}
      {step === 3 && (
        <div className="space-y-5 animate-in fade-in">
          <div>
            <h2 className="text-base font-black text-text">3. Payout & Financial Settlement</h2>
            <p className="text-xs text-muted">Configure how you will receive automated disbursements from sales.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {PAYOUT_METHODS.map((pm) => (
              <div
                key={pm.id}
                onClick={() => setPayoutMethod(pm.id)}
                className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition ${
                  payoutMethod === pm.id
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
                    : "border-border bg-surface hover:bg-muted-bg/50"
                }`}
              >
                <span className="text-2xl">{pm.icon}</span>
                <div>
                  <p className="text-xs font-black text-text">{pm.label}</p>
                  <p className="text-[11px] text-muted mt-0.5">{pm.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="payoutAccountName" className={labelClass}>
                Account / Beneficiary Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="payoutAccountName"
                type="text"
                value={payoutAccountName}
                onChange={(e) => setPayoutAccountName(e.target.value)}
                placeholder="e.g. John Doe / Apex Corp Ltd"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="payoutAccountNumber" className={labelClass}>
                {payoutMethod === "bank" ? "Bank Account Number" : "Mobile Wallet Number"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                id="payoutAccountNumber"
                type="text"
                value={payoutAccountNumber}
                onChange={(e) => setPayoutAccountNumber(e.target.value)}
                placeholder={payoutMethod === "bank" ? "13-16 digit account number" : "017XXXXXXXX"}
                className={inputClass}
                required
              />
            </div>
          </div>

          {payoutMethod === "bank" && (
            <div>
              <label htmlFor="bankBranch" className={labelClass}>
                Bank & Branch Name (Optional)
              </label>
              <input
                id="bankBranch"
                type="text"
                value={bankBranch}
                onChange={(e) => setBankBranch(e.target.value)}
                placeholder="e.g. City Bank - Gulshan Branch"
                className={inputClass}
              />
            </div>
          )}
        </div>
      )}

      {/* STEP 4: REVIEW & CONFIRM */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-base font-black text-text">4. Application Summary & Agreement</h2>
            <p className="text-xs text-muted">Review your application before submitting to the ShopNest verification team.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-muted-bg/30 p-4 text-xs space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase text-primary">Store Info</span>
              <p className="font-black text-text">{storeName}</p>
              <p className="text-muted">{category}</p>
              <p className="text-muted line-clamp-2">{description}</p>
            </div>

            <div className="rounded-2xl border border-border bg-muted-bg/30 p-4 text-xs space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase text-primary">KYC & Owner</span>
              <p className="font-black text-text">{ownerName}</p>
              <p className="text-muted">{contactPhone}</p>
              <p className="text-muted truncate">NID: {nidOrTradeLicense}</p>
            </div>

            <div className="rounded-2xl border border-border bg-muted-bg/30 p-4 text-xs space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase text-primary">Payout Channel</span>
              <p className="font-black text-text uppercase">{payoutMethod}</p>
              <p className="text-muted">{payoutAccountName}</p>
              <p className="text-muted font-mono">{payoutAccountNumber}</p>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-muted leading-relaxed">
              I certify that all information provided is accurate and authentic. I agree to comply with the{" "}
              <strong className="text-text">ShopNest Seller Code of Conduct</strong>, guarantee genuine products, and adhere
              to the fulfillment SLA.
            </span>
          </label>
        </div>
      )}

      {/* Buttons */}
      <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 rounded-2xl border border-border px-5 py-2.5 text-xs font-bold text-text hover:bg-muted-bg transition cursor-pointer"
          >
            <FiArrowLeft /> Back
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-black text-white hover:bg-primary-hover shadow-lg shadow-primary/25 transition cursor-pointer"
          >
            Continue <FiArrowRight />
          </button>
        ) : (
          <button
            type="button"
            disabled={loading || !agreedToTerms}
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 text-xs font-black text-white hover:opacity-90 shadow-lg shadow-emerald-600/25 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Submitting Application..." : isResubmission ? "Re-submit Application" : "Submit for Verification 🚀"}
          </button>
        )}
      </div>
    </div>
  );
}