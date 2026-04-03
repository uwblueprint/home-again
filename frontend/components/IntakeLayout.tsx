"use client";

import React from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import {
  IntakeFooterProvider,
  useIntakeFooter,
} from "@/components/intake/IntakeFooterContext";
import { Button } from "@/components/ui/button";
import { StepIndicator, type Step } from "@/components/ui/step-indicator";
import {
  INTAKE_AGENCY,
  INTAKE_MAIN_AGENT,
  INTAKE_OTHER_AGENTS,
  INTAKE_REVIEW,
} from "@/constants/Routes";

const INTAKE_STEPS: Step[] = [
  { label: "Agency", path: INTAKE_AGENCY },
  { label: "Main Agent", path: INTAKE_MAIN_AGENT },
  { label: "Other Agents", path: INTAKE_OTHER_AGENTS },
  { label: "Review", path: INTAKE_REVIEW },
];

interface IntakeLayoutProps {
  children: React.ReactNode;
}

function IntakeLayoutContent({ children }: IntakeLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { footerState } = useIntakeFooter();

  const currentStepIndex = INTAKE_STEPS.findIndex(
    (step) => pathname === step.path
  );
  const currentStep = currentStepIndex === -1 ? 0 : currentStepIndex;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === INTAKE_STEPS.length - 1;

  function handleBack() {
    if (isFirstStep) {
      return;
    }

    const prevPath = INTAKE_STEPS[currentStep - 1]?.path;
    if (prevPath) {
      router.push(prevPath);
    }
  }

  async function handleNext() {
    if (isLastStep) {
      await footerState.submitHandler?.();
      return;
    }

    const nextPath = INTAKE_STEPS[currentStep + 1]?.path;
    if (nextPath) {
      router.push(nextPath);
    }
  }

  const isSubmitDisabled =
    isLastStep &&
    (!footerState.submitHandler ||
      footerState.isSubmitting ||
      footerState.isSubmitDisabled);

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-10 py-5 bg-background">
        <Image
          src="/logo192.png"
          alt="Home Again"
          width={91}
          height={55}
          className="object-contain"
        />

        <StepIndicator steps={INTAKE_STEPS} currentStep={currentStep} />

        <div className="w-[91px]" />
      </header>

      <main className="flex-1 px-16 py-8">{children}</main>

      <footer className="border-t border-border px-16 py-8 flex items-center justify-between gap-6">
        <div className="min-h-5 flex-1">
          {isLastStep && footerState.submitError ? (
            <p className="text-sm text-destructive">{footerState.submitError}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="h-10 px-6"
            onClick={handleBack}
            disabled={footerState.isSubmitting}
          >
            Back
          </Button>
          <Button
            className="h-10 px-6"
            onClick={handleNext}
            disabled={isSubmitDisabled}
          >
            {isLastStep && footerState.isSubmitting
              ? "Submitting..."
              : isLastStep
                ? "Submit"
                : "Next"}
          </Button>
        </div>
      </footer>
    </div>
  );
}

export default function IntakeLayout({ children }: IntakeLayoutProps) {
  return (
    <IntakeFooterProvider>
      <IntakeLayoutContent>{children}</IntakeLayoutContent>
    </IntakeFooterProvider>
  );
}
