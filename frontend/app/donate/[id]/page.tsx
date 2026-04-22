"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  DonationFormProvider,
  useDonationForm,
  validateItems,
} from "@/app/donate/context/DonationFormContext";
import DonationLayout from "@/app/donate/DonationLayout";
import StepFurnitureDetails from "@/app/donate/components/StepFurnitureDetails";
import StepSchedulePickup from "@/app/donate/components/StepSchedulePickup";
import StepDonationSummary from "@/app/donate/components/StepDonationSummary";
import { validatePickupAddress } from "@/app/donate/components/PickupAddressForm";
import { Button } from "@/common/components/ui/button";

// For UUID Validation: Enforces 36-character format: xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function DonationFlowPageInner() {
  const router = useRouter();
  const { formState, addItem, setFormState } = useDonationForm();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [validationError, setValidationError] = useState<string | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  // Clear error automatically once all items are valid
  useEffect(() => {
    if (validationError && validateItems(formState.items)) {
      setValidationError(null);
    }
  }, [formState.items, validationError]);

  // Scroll to error when it appears
  useEffect(() => {
    if (validationError) {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [validationError]);

  function handleNext() {
    if (currentStep === 1) {
      if (!validateItems(formState.items)) {
        setValidationError(
          "Please complete all item details before proceeding."
        );
        return;
      }
      setValidationError(null);
    }
    if (currentStep === 2) {
      const errors = validatePickupAddress(formState.pickupAddress);
      if (Object.keys(errors).length > 0) {
        setFormState((prev) => ({ ...prev, pickupSubmitAttempted: true }));
        return;
      }
    }
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

  const leftAction =
    currentStep === 1 ? (
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="gap-1.5 px-5 py-5 hover:bg-[var(--unofficial-outline-hover)]"
        onClick={() => {
          if (!validateItems(formState.items)) {
            setValidationError(
              "Please complete all item details before adding another."
            );
            return;
          }
          setValidationError(null);
          addItem();
        }}
      >
        <Plus className="size-4" />
        Add Item
      </Button>
    ) : undefined;

  return (
    <DonationLayout
      currentStep={currentStep}
      onNext={handleNext}
      onBack={handleBack}
      leftAction={leftAction}
    >
      {currentStep === 1 && (
        <>
          <StepFurnitureDetails />
          {validationError && (
            <p ref={errorRef} className="text-sm text-destructive">
              {validationError}
            </p>
          )}
        </>
      )}
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
          This donation request URL is not valid. Start again from the donation
          form.
        </p>
        <Link
          href="/donate"
          className="font-medium text-primary underline underline-offset-4"
        >
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
