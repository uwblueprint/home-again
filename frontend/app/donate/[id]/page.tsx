"use client";

import React, { useState } from "react";
import { DonationFormProvider } from "@/components/donation-requests/DonationFormContext";
import DonationLayout from "@/components/donation-requests/DonationLayout";
import StepFurnitureDetails from "@/components/donation-requests/StepFurnitureDetails";
import StepSchedulePickup from "@/components/donation-requests/StepSchedulePickup";
import StepDonationSummary from "@/components/donation-requests/StepDonationSummary";

function DonationFlowPageInner() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  function handleNext() {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
    } else if (typeof window !== "undefined") {
      window.alert("Your donation request has been submitted.");
    }
  }

  const handleBack =
    currentStep > 1
      ? () => setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3)
      : undefined;

  return (
    <DonationLayout currentStep={currentStep} onNext={handleNext} onBack={handleBack}>
      {currentStep === 1 && <StepFurnitureDetails />}
      {currentStep === 2 && <StepSchedulePickup />}
      {currentStep === 3 && <StepDonationSummary />}
    </DonationLayout>
  );
}

export default function DonationRequestFlowPage() {
  return (
    <DonationFormProvider>
      <DonationFlowPageInner />
    </DonationFormProvider>
  );
}
