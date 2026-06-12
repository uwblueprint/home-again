"use client";

import React, { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  IntakeFooterProvider,
  useIntakeFooter,
} from "@/app/agent-intake/context/IntakeFooterContext";
import {
  IntakeProvider,
  useIntakeContext,
} from "@/app/agent-intake/context/IntakeContext";
import { FieldError } from "@/common/components/forms";
import { Button } from "@/common/components/ui/button";
import {
  StepIndicator,
  type Step,
} from "@/common/components/ui/step-indicator";
import {
  INTAKE_AGENCY,
  INTAKE_MAIN_AGENT,
  INTAKE_OTHER_AGENTS,
  INTAKE_REVIEW,
} from "@/common/constants/Routes";
import { useIntakeFormStore } from "@/app/agent-intake/stores/intakeFormStore";

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
  const { footerState, runSubmitHandler, hasSubmitHandler } = useIntakeFooter();
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

    const nextPath = INTAKE_STEPS[currentStep + 1]?.path;
    if (nextPath) {
      router.push(nextPath);
    }
  }

  const isSubmitDisabled =
    isLastStep &&
    (!hasSubmitHandler ||
      footerState.isSubmitting ||
      footerState.isSubmitDisabled);

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <header className="flex min-h-[151px] items-center justify-between bg-background px-10 py-5">
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

      <footer className="border-t border-border flex items-center justify-between gap-6 px-16 py-8">
        <div className="min-h-5 flex-1">
          {isLastStep ? (
            <FieldError message={footerState.submitError ?? undefined} />
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="h-10 px-6"
            onClick={handleBack}
            disabled={
              isNavigating || footerState.isSubmitting || isNavigationLocked
            }
          >
            Back
          </Button>
          <Button
            className="h-10 px-6"
            onClick={handleNext}
            disabled={
              isLastStep ? isSubmitDisabled : isNavigating || isNavigationLocked
            }
          >
            {isLastStep && footerState.isSubmitting
              ? "Submitting..."
              : isLastStep
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
      <IntakeFooterProvider>
        <IntakeLayoutInner>{children}</IntakeLayoutInner>
      </IntakeFooterProvider>
    </IntakeProvider>
  );
}
