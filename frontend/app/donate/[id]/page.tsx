"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DonationFormProvider } from "@/components/donation-requests/DonationFormContext";
import DonationLayout from "@/components/donation-requests/DonationLayout";
import StepFurnitureDetails from "@/components/donation-requests/StepFurnitureDetails";
import StepSchedulePickup from "@/components/donation-requests/StepSchedulePickup";
import StepDonationSummary from "@/components/donation-requests/StepDonationSummary";

// For UUID Validation: Enforces 36-character format: xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function DonationFlowPageInner() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  function handleNext() {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
    } else {
      router.push("/donate/request-submitted");
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
  const params = useParams<{ id: string }>();
  const donorId = typeof params.id === "string" ? params.id : "";

  if (!UUID_REGEX.test(donorId)) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold">Invalid donation link</h1>
        <p className="text-muted-foreground">
          This donation request URL is not valid. Start again from the donation form.
        </p>
        <Link href="/donate" className="font-medium text-primary underline underline-offset-4">
          Go to donation form
        </Link>
      </main>
    );
  }

  return (
    <DonationFormProvider initialDonorId={donorId}>
      <DonationFlowPageInner />
    </DonationFormProvider>
  );
}
