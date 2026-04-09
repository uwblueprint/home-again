"use client";

import React from "react";
import Image from "next/image";
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
  const { formState, setSubmitAttempted } = useDonationForm();

  const nextLabel =
    currentStep === 1
      ? "Schedule Pickup"
      : currentStep === 2
        ? "Continue to Summary"
        : "Submit Request";

  function handleNextClick() {
    if (currentStep === 3) {
      setSubmitAttempted(true);
      const isValid =
        formState.feeAgreement &&
        formState.smokingInHousehold !== null &&
        formState.petsInHousehold !== null;
      if (isValid) onNext();
    } else {
      onNext();
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 pb-28">
      {/* Header */}
      <header className="flex items-center justify-center py-12">
        <div className="absolute left-4 top-4 md:left-8">
          <Image 
            src="/hafb_logo.svg" 
            alt="Home Again Furniture Bank" 
            width={68} 
            height={41} 
            className="h-auto w-auto" 
            priority 
          />
        </div>
        <StepIndicator steps={STEPS} currentStep={stepIndex} />
      </header>

      {/* Step content — heading is now inside each step component */}
      <div className="flex w-full flex-col gap-6">{children}</div>

      {/* Bottom nav — fixed */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-10",
          "border-t border-border bg-background px-4 py-8",
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
              onClick={handleNextClick}
            >
              {nextLabel}
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}
