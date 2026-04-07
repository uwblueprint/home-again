"use client";

import React from "react";
import { StepIndicator } from "@/components/ui/step-indicator";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDonationForm } from "@/components/donation-requests/DonationFormContext";

const STEPS = [
  { label: "Furniture Details" },
  { label: "Schedule a Pickup" },
  { label: "Donation Summary" },
];

interface DonationLayoutProps {
  currentStep: 1 | 2 | 3;
  onNext: () => void;
  onBack?: () => void;
  /** Optional element rendered on the left side of the bottom nav (e.g. "+ Add Item"). */
  leftAction?: React.ReactNode;
  children: React.ReactNode;
}

export default function DonationLayout({
  currentStep,
  onNext,
  onBack,
  leftAction,
  children,
}: DonationLayoutProps) {
  const stepIndex = currentStep - 1;
  const { formState } = useDonationForm();

  const nextLabel =
    currentStep === 1
      ? "Schedule Pickup"
      : currentStep === 2
        ? "Continue to Summary"
        : "Submit Request";

  const isNextDisabled = currentStep === 3 && !formState.feeAgreement;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 pb-28">
      {/* Header */}
      <header className="flex justify-center pt-8">
        <StepIndicator steps={STEPS} currentStep={stepIndex} />
      </header>

      {/* Step content — heading is now inside each step component */}
      <div className="flex w-full flex-col gap-6">{children}</div>

      {/* Bottom nav — fixed */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-10",
          "border-t border-border bg-background px-4 py-4",
        )}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
          {/* Left side (e.g. + Add Item) */}
          <div>{leftAction}</div>

          {/* Right side (Back + Next) */}
          <div className="flex items-center gap-2">
            {onBack && (
              <Button
                size="lg"
                variant="secondary"
                className="px-6 py-5"
                onClick={onBack}
              >
                Back
              </Button>
            )}
            <Button
              size="lg"
              className="px-6 py-5"
              onClick={onNext}
              disabled={isNextDisabled}
            >
              {nextLabel}
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}
