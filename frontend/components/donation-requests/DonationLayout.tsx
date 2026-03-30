"use client";

import React from "react";
import { StepIndicator } from "@/components/ui/step-indicator";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Furniture Details" },
  { label: "Schedule a Pickup" },
  { label: "Donation Summary" },
];

interface DonationLayoutProps {
  currentStep: 1 | 2 | 3;
  onNext: () => void;
  onBack?: () => void;
  children: React.ReactNode;
}

export default function DonationLayout({
  currentStep,
  onNext,
  onBack,
  children,
}: DonationLayoutProps) {
  const stepIndex = currentStep - 1;

  const nextLabel =
    currentStep === 1 ? "Schedule Pickup" :
    currentStep === 2 ? "Continue to Summary" :
    "Submit Request";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4">
      {/* Header */}
      <header className="pt-8 flex justify-center">
        <StepIndicator steps={STEPS} currentStep={stepIndex} />
      </header>

      <h2 className="text-xl font-semibold text-foreground">
        {STEPS[stepIndex].label}
      </h2>

      {/* Content card */}
      <div className="flex w-full flex-col gap-6 rounded-xl border border-border bg-background p-6 shadow-sm">
        {children}
      </div>

      {/* Bottom nav */}
      <nav className={cn(
        "mt-auto w-screen max-w-none",
        "-mx-[calc((100vw-100%)/2)]",
        "border-t border-border bg-background px-4 py-6 pb-6"
      )}>
        <div className="ml-auto flex w-full max-w-3xl items-center justify-end gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex min-h-[40px] items-center px-6 py-2.5 rounded-lg bg-neutral-100 text-sm text-muted-foreground hover:bg-neutral-200 cursor-pointer"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            className="flex min-h-[40px] items-center px-6 py-2.5 rounded-lg bg-[#9E4876] text-white text-sm hover:bg-[#9E4876]/90 cursor-pointer"
          >
            {nextLabel}
          </button>
        </div>
      </nav>
    </div>
  );
}