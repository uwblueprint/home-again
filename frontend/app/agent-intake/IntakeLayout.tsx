"use client";

import React, { useState } from "react";
import {
  IntakeFooterProvider,
  useIntakeFooter,
} from "@/app/agent-intake/context/IntakeFooterContext";
import {
  IntakeProvider,
  useIntakeContext,
} from "@/app/agent-intake/context/IntakeContext";
import { Footer, Header } from "@/common/components/forms";
import {
  StepIndicator,
  type Step,
} from "@/common/components/ui/step-indicator";
import { useIntakeFormStore } from "@/app/agent-intake/stores/intakeFormStore";

const OTHER_AGENTS_STEP = 2;
const REVIEW_STEP = 3;

const INTAKE_STEPS: Step[] = [
  { label: "Agency" },
  { label: "Your Details" },
  { label: "Other Agents" },
  { label: "Review" },
];

interface IntakeLayoutProps {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  children: React.ReactNode;
}

function IntakeLayoutInner({
  currentStep,
  setCurrentStep,
  children,
}: IntakeLayoutProps) {
  const { runValidator } = useIntakeContext();
  const { footerState, runSubmitHandler, hasSubmitHandler } = useIntakeFooter();
  const [isNavigating, setIsNavigating] = useState(false);
  const otherAgents = useIntakeFormStore((state) => state.otherAgents);
  const otherAgentsStepLocked = useIntakeFormStore(
    (state) => state.otherAgentsStepLocked
  );

  const isOtherAgentsStep = currentStep === OTHER_AGENTS_STEP;
  const isNavigationLocked = isOtherAgentsStep && otherAgentsStepLocked;
  const hasSavedOtherAgent = otherAgents.some(
    (agent) => agent.email.trim() !== ""
  );

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === REVIEW_STEP;

  function handleBack() {
    if (isNavigationLocked || isFirstStep) {
      return;
    }

    setCurrentStep((prev) => prev - 1);
  }

  async function handleNext() {
    if (isLastStep) {
      await runSubmitHandler();
      return;
    }

    if (isNavigationLocked) {
      return;
    }

    setIsNavigating(true);
    let valid: boolean;
    try {
      valid = await runValidator();
    } finally {
      setIsNavigating(false);
    }

    if (!valid) {
      return;
    }

    setCurrentStep((prev) => prev + 1);
  }

  const isSubmitDisabled =
    isLastStep &&
    (!hasSubmitHandler ||
      footerState.isSubmitting ||
      footerState.isSubmitDisabled);

  const nextLabel = isLastStep
    ? "Submit"
    : currentStep === OTHER_AGENTS_STEP
      ? hasSavedOtherAgent
        ? "Next"
        : "Maybe later"
      : "Next";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header className="min-h-[151px] px-10">
        <StepIndicator steps={INTAKE_STEPS} currentStep={currentStep} />
      </Header>

      <main className="flex-1 px-16 py-8">{children}</main>

      <Footer
        className="mt-auto w-full px-16 py-8"
        footerAlert={
          isLastStep ? footerState.submitError ?? undefined : undefined
        }
        onBack={isFirstStep ? undefined : handleBack}
        isBackDisabled={
          isNavigating || footerState.isSubmitting || isNavigationLocked
        }
        backVariant="secondary"
        onNext={handleNext}
        nextLabel={nextLabel}
        submittingLabel="Submitting..."
        isNextDisabled={
          isLastStep ? isSubmitDisabled : isNavigating || isNavigationLocked
        }
        isSubmitting={isLastStep && footerState.isSubmitting}
      />
    </div>
  );
}

export default function IntakeLayout({
  currentStep,
  setCurrentStep,
  children,
}: IntakeLayoutProps) {
  return (
    <IntakeProvider>
      <IntakeFooterProvider>
        <IntakeLayoutInner
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        >
          {children}
        </IntakeLayoutInner>
      </IntakeFooterProvider>
    </IntakeProvider>
  );
}
