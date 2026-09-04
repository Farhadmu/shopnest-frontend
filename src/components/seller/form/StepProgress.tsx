// frontend/src/components/seller/form/StepProgress.tsx
"use client";

import { FiCheckCircle, FiShield, FiCreditCard, FiFileText } from "react-icons/fi";
import { FaStore } from "react-icons/fa";
import { ApplicationStep } from "@/types/seller-application";

interface StepProgressProps {
  currentStep: ApplicationStep;
  onStepClick: (step: ApplicationStep) => void;
}

const STEPS = [
  { num: 1 as const, label: "Store Profile", icon: FaStore },
  { num: 2 as const, label: "KYC & Business", icon: FiShield },
  { num: 3 as const, label: "Payout Details", icon: FiCreditCard },
  { num: 4 as const, label: "Review & Submit", icon: FiFileText },
];

export function StepProgress({ currentStep, onStepClick }: StepProgressProps) {
  return (
    <div className="mb-5 space-y-2.5">
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isDone = currentStep > s.num;
          const isCurrent = currentStep === s.num;

          return (
            <button
              key={s.num}
              type="button"
              onClick={() => isDone && onStepClick(s.num)}
              disabled={!isDone}
              className={`flex flex-col items-center gap-1.5 rounded-xl p-2 transition ${
                isCurrent
                  ? "bg-primary/10 text-primary font-black shadow-xs"
                  : isDone
                  ? "text-success font-bold cursor-pointer hover:bg-muted-bg"
                  : "text-muted font-medium cursor-not-allowed opacity-60"
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs transition ${
                  isCurrent
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : isDone
                    ? "bg-success text-white shadow-xs"
                    : "bg-muted-bg text-muted"
                }`}
              >
                {isDone ? <FiCheckCircle size={13} /> : <Icon size={13} />}
              </div>
              <span className="text-[11px] leading-none hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted-bg">
        <div
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${(currentStep / 4) * 100}%` }}
          role="progressbar"
          aria-valuenow={(currentStep / 4) * 100}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Application Progress"
        />
      </div>
    </div>
  );
}