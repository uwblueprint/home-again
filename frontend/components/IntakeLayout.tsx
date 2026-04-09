"use client";

import React, { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { IntakeProvider, useIntakeContext } from "@/context/IntakeContext";
import { Button } from "@/components/ui/button";
import { StepIndicator, type Step } from "@/components/ui/step-indicator";
import {
  INTAKE_AGENCY,
  INTAKE_MAIN_AGENT,
  INTAKE_OTHER_AGENTS,
  INTAKE_REVIEW,
} from "@/constants/Routes";
import { useIntakeFormStore } from "@/stores/intakeFormStore";

const OTHER_AGENTS_STEP = 2;

const INTAKE_STEPS: Step[] = [
  { label: "Agency", path: INTAKE_AGENCY },
  { label: "Your Details", path: INTAKE_MAIN_AGENT },
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
  const otherAgents = useIntakeFormStore((state) => state.otherAgents);
  const otherAgentsStepLocked = useIntakeFormStore(
    (state) => state.otherAgentsStepLocked
  );

  const currentStepIndex = INTAKE_STEPS.findIndex(
    (step) => step.path !== undefined && pathname.startsWith(step.path)
  );
  const currentStep = currentStepIndex === -1 ? 0 : currentStepIndex;
  const isOtherAgentsStep = currentStep === OTHER_AGENTS_STEP;
  const isNavigationLocked = isOtherAgentsStep && otherAgentsStepLocked;
  const hasSavedOtherAgent = otherAgents.some(
    (agent) =>
      agent.firstName.trim() !== "" &&
      agent.lastName.trim() !== "" &&
      agent.email.trim() !== "" &&
      agent.phone.trim() !== ""
  );

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === INTAKE_STEPS.length - 1;

  function handleBack() {
    if (isNavigationLocked || isFirstStep) {
      return;
    }

    const prevPath = INTAKE_STEPS[currentStep - 1]?.path;
    if (prevPath) {
      router.push(prevPath);
    }
  }

  async function handleNext() {
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
      <header className="flex items-center justify-between px-10 py-5 bg-background">
        <Image
          src="/hafb_logo.svg"
          alt="Home Again"
          width={91}
          height={55}
          className="object-contain"
        />

        <StepIndicator steps={INTAKE_STEPS} currentStep={currentStep} />

        <div className="w-[91px]" />
      </header>

      <main className="flex-1 px-16 py-8">{children}</main>

      <footer className="border-t border-border px-16 py-8 flex items-center justify-end">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="h-10 px-6"
            onClick={handleBack}
            disabled={isNavigating || isNavigationLocked}
          >
            Back
          </Button>
          <Button
            className="h-10 px-6"
            onClick={handleNext}
            disabled={isNavigating || isNavigationLocked}
          >
            {isLastStep
              ? "Submit"
              : currentStep === OTHER_AGENTS_STEP
                ? hasSavedOtherAgent
                  ? "Next"
                  : "Maybe later"
                : "Next"}
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
