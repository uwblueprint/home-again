"use client";

import React from "react";
import { StepIndicator } from "@/components/ui/step-indicator";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
      <div className="flex w-full flex-col gap-6 rounded-xl border border-border bg-background p-6 pb-24 shadow-sm">
        {children}
      </div>

      {/* Bottom nav */}
      <nav className={cn(
        "mt-auto bottom-0 w-screen max-w-none",
        "-mx-[calc((100vw-100%)/2)]",
        "border-t border-border bg-background px-4 py-6 pb-6"
      )}>
        <div className="ml-auto flex w-full max-w-3xl items-center justify-end gap-2">
          {onBack && (
            <Button size="lg" variant="secondary" className="px-6 py-5" onClick={onBack}>
              Back
            </Button>
          )}
          <Button size="lg" className="px-6 py-5" onClick={onNext}>
            {nextLabel}
          </Button>
        </div>
      </nav>
    </div>
  );
}