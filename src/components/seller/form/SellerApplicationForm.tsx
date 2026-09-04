// frontend/src/components/seller/form/SellerApplicationForm.tsx
"use client";

import React, { useState } from "react";
import { registerStore, updateMyStore, RegisterStoreInput, MyStore } from "@/lib/api/sellers";
import { FiArrowRight, FiArrowLeft, FiAlertCircle, FiLoader } from "react-icons/fi";

import { ApplicationStep, FormDataState, SellerApplicationFormProps } from "@/types/seller-application";
import { StepProgress } from "./StepProgress";
import { Step1StoreProfile } from "./Step1StoreProfile";
import { Step2KycLegal } from "./Step2KycLegal";
import { Step3PayoutDetails } from "./Step3PayoutDetails";
import { Step4ReviewSubmit } from "./Step4ReviewSubmit";

export function SellerApplicationForm({ initialData, isResubmission = false, onSuccess }: SellerApplicationFormProps) {
  const [step, setStep] = useState<ApplicationStep>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<FormDataState>({
    storeName: initialData?.storeName || "",
    category: initialData?.businessInfo?.category || "Electronics & Gadgets",
    description: initialData?.description || "",
    logo: initialData?.logo || "",
    banner: initialData?.banner || "",
    ownerName: initialData?.businessInfo?.ownerName || "",
    contactPhone: initialData?.businessInfo?.contactPhone || "",
    businessAddress: initialData?.businessInfo?.businessAddress || "",
    nidOrTradeLicense: initialData?.businessInfo?.nidOrTradeLicense || "",
    taxId: initialData?.businessInfo?.taxId || "",
    payoutMethod: initialData?.businessInfo?.payoutMethod || "bank",
    payoutAccountName: initialData?.businessInfo?.payoutAccountName || "",
    payoutAccountNumber: initialData?.businessInfo?.payoutAccountNumber || "",
    bankBranch: initialData?.businessInfo?.bankBranch || "",
    agreedToTerms: false,
  });

  const handleFieldChange = (field: keyof FormDataState, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (formData.storeName.trim().length < 2) {
      setError("Store name must be at least 2 characters.");
      return false;
    }
    if (formData.description.trim().length < 10) {
      setError("Store description must be at least 10 characters.");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep2 = () => {
    if (formData.ownerName.trim().length < 2) {
      setError("Legal owner full name is required for verification.");
      return false;
    }
    if (formData.contactPhone.trim().length < 6) {
      setError("Valid official contact phone is required.");
      return false;
    }
    if (formData.businessAddress.trim().length < 5) {
      setError("Business or warehouse address is required.");
      return false;
    }
    if (!formData.nidOrTradeLicense.trim()) {
      setError("NID or Trade License number is required for store identity verification.");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep3 = () => {
    if (!formData.payoutAccountNumber.trim()) {
      setError("Payout account/wallet number is required to receive earnings.");
      return false;
    }
    if (!formData.payoutAccountName.trim()) {
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
    if (step > 1) setStep((prev) => (prev - 1) as ApplicationStep);
  };

  const handleSubmit = async () => {
    if (!formData.agreedToTerms) {
      setError("You must agree to the ShopNest Merchant Policy & Terms to proceed.");
      return;
    }

    const payload: RegisterStoreInput = {
      storeName: formData.storeName.trim(),
      description: formData.description.trim(),
      logo: formData.logo.trim() || undefined,
      banner: formData.banner.trim() || undefined,
      businessInfo: {
        ownerName: formData.ownerName.trim(),
        contactPhone: formData.contactPhone.trim(),
        businessAddress: formData.businessAddress.trim(),
        nidOrTradeLicense: formData.nidOrTradeLicense.trim(),
        taxId: formData.taxId.trim() || undefined,
        category: formData.category,
        payoutMethod: formData.payoutMethod,
        payoutAccountName: formData.payoutAccountName.trim(),
        payoutAccountNumber: formData.payoutAccountNumber.trim(),
        bankBranch: formData.bankBranch.trim() || undefined,
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

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 sm:p-7 shadow-xl shadow-primary/5">
      <div>
        <StepProgress currentStep={step} onStepClick={setStep} />

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-error/20 bg-error/10 p-3 text-xs font-semibold text-error">
            <FiAlertCircle className="shrink-0 text-sm" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 && <Step1StoreProfile formData={formData} onChange={handleFieldChange} />}
        {step === 2 && <Step2KycLegal formData={formData} onChange={handleFieldChange} />}
        {step === 3 && <Step3PayoutDetails formData={formData} onChange={handleFieldChange} />}
        {step === 4 && <Step4ReviewSubmit formData={formData} onChange={handleFieldChange} />}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4 mt-6">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-xs font-bold text-text hover:bg-muted-bg transition cursor-pointer"
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
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-black text-white hover:bg-primary-hover shadow-lg shadow-primary/25 transition cursor-pointer"
          >
            Continue <FiArrowRight />
          </button>
        ) : (
          <button
            type="button"
            disabled={loading || !formData.agreedToTerms}
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-xl bg-success px-6 py-2.5 text-xs font-black text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-success/25 transition cursor-pointer"
          >
            {loading && <FiLoader className="animate-spin" />}
            {isResubmission ? "Re-submit Application" : "Submit for Verification 🚀"}
          </button>
        )}
      </div>
    </div>
  );
}