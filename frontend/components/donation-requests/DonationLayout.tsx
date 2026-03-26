"use client";

import React from "react";
import { StepIndicator } from "@/components/ui/step-indicator";

const STEPS = [
  { label: "Furniture Details" },
  { label: "Schedule a Pickup" },
  { label: "Donation Summary" },
];

interface DonationLayoutProps {
  currentStep: 1 | 2 | 3;
  onNext: () => void;
  onBack: () => void;
  children: React.ReactNode;
}

export default function DonationLayout({ currentStep, onNext, onBack, children }: DonationLayoutProps) {
  return (
    <div>
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <StepIndicator
          steps={STEPS}
          currentStep={currentStep - 1}
        />
      </header>
      <main>{children}</main>
      <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-6 py-4 flex justify-between items-center">
        {currentStep > 1 ? (
          <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded-md text-sm">
            Back
          </button>
        ) : (
          <span /> 
        )}
        <button onClick={onNext} className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm">
          {currentStep === 1 ? "Schedule Pickup" : currentStep === 2 ? "Continue to Summary" : "Submit Request"}
        </button>
      </footer>
    </div>
  );
}