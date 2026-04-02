"use client";

import React, { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StepIndicator, type Step } from "@/components/ui/step-indicator";
import {
  INTAKE_AGENCY,
  INTAKE_MAIN_AGENT,
  INTAKE_OTHER_AGENTS,
  INTAKE_REVIEW,
} from "@/constants/Routes";
import { IntakeProvider, useIntakeContext } from "@/context/IntakeContext";

const INTAKE_STEPS: Step[] = [
  { label: "Agency", path: INTAKE_AGENCY },
  { label: "Main Agent", path: INTAKE_MAIN_AGENT },
  { label: "Other Agents", path: INTAKE_OTHER_AGENTS },
  { label: "Review", path: INTAKE_REVIEW },
];

interface IntakeLayoutProps {
  children: React.ReactNode;
}

function IntakeLayoutInner({ children }: IntakeLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { runValidator } = useIntakeContext();
  const [isNavigating, setIsNavigating] = useState(false);

  const currentStepIndex = INTAKE_STEPS.findIndex(
    (step) => step.path !== undefined && pathname.startsWith(step.path)
  );
  const currentStep = currentStepIndex === -1 ? 0 : currentStepIndex;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === INTAKE_STEPS.length - 1;

  function handleBack() {
    if (isFirstStep) {
      // TODO: Navigate to login page once it's implemented
      return;
    }
    const prevPath = INTAKE_STEPS[currentStep - 1]?.path;
    if (prevPath) {
      router.push(prevPath);
    }
  }

  async function handleNext() {
    setIsNavigating(true);
    const valid = await runValidator();
    setIsNavigating(false);
    if (!valid) return;

    if (isLastStep) {
      // TODO: Submit the full intake form to the backend
      return;
    }
    const nextPath = INTAKE_STEPS[currentStep + 1]?.path;
    if (nextPath) {
      router.push(nextPath);
    }
  }

  return (
    <div className="bg-background min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-10 py-5 bg-background">
        <Image
          src="/logo192.png"
          alt="Home Again"
          width={91}
          height={55}
          className="object-contain"
        />

        <StepIndicator steps={INTAKE_STEPS} currentStep={currentStep} />

        {/* Spacer to balance the logo on the left */}
        <div className="w-[91px]" />
      </header>

      {/* Step Content */}
      <main className="flex-1 px-16 py-8">{children}</main>

      {/* Bottom Navigation */}
      <footer className="border-t border-border px-16 py-8 flex items-center justify-end">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="h-10 px-6"
            onClick={handleBack}
            disabled={isNavigating}
          >
            Back
          </Button>
          <Button className="h-10 px-6" onClick={handleNext} disabled={isNavigating}>
            {isLastStep ? "Submit" : "Next"}
          </Button>
        </div>
      </footer>
    </div>
  );
}

export default function IntakeLayout({ children }: IntakeLayoutProps) {
  return (
    <IntakeProvider>
      <IntakeLayoutInner>{children}</IntakeLayoutInner>
    </IntakeProvider>
  );
}
