"use client";

import { type ReactNode, useState } from "react";
import { StepIndicator } from "@/common/components/ui/step-indicator";
import { Header, Footer } from "@/common/components/forms";

export interface Substep {
  label: string;
  content: ReactNode;
  leftAction?: ReactNode;
}

export interface Step {
  label: string;
  substeps: Substep[];
}

type MultiStepLayoutProps = {
  steps: Step[];
  flowTitle?: string;
  onSubmit: () => void;
  isSubmitting?: boolean;
  isNextDisabled?: boolean;
  footerAlert?: string;
  submitLabel?: string;
};

function MultiStepLayout({
  steps,
  flowTitle,
  onSubmit,
  isSubmitting = false,
  isNextDisabled = false,
  footerAlert,
  submitLabel = "Submit",
}: MultiStepLayoutProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [substepIndex, setSubstepIndex] = useState(0);

  const step = steps[stepIndex];
  const substep = step.substeps[substepIndex];
  const isFirst = stepIndex === 0 && substepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;
  const isLastSubstep = substepIndex === step.substeps.length - 1;

  const handleNext = () => {
    if (isLastStep && isLastSubstep) {
      onSubmit();
      return;
    }
    if (isLastSubstep) {
      setStepIndex((prev) => prev + 1);
      setSubstepIndex(0);
      return;
    }
    setSubstepIndex((prev) => prev + 1);
  };

  const handleBack = () => {
    if (substepIndex > 0) {
      setSubstepIndex((prev) => prev - 1);
      return;
    }
    if (stepIndex > 0) {
      const previousStep = steps[stepIndex - 1];
      setStepIndex((prev) => prev - 1);
      setSubstepIndex(previousStep.substeps.length - 1);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center gap-6 px-4 pb-4 pt-12">
      <Header>
        <StepIndicator
          steps={steps.map((s) => ({ label: s.label }))}
          currentStep={stepIndex}
          className="flex-wrap justify-center"
        />
      </Header>

      <div className="mt-4 flex w-full flex-col gap-6 bg-background">
        {flowTitle ? (
          <h1 className="text-xl font-semibold text-foreground">{flowTitle}</h1>
        ) : null}
        <h2 className="text-lg font-semibold text-foreground">
          {substep.label}
        </h2>
        <div>{substep.content}</div>
      </div>

      <Footer
        className="mt-auto max-w-7xl mx-auto"
        leftAction={substep.leftAction}
        footerAlert={footerAlert}
        onBack={isFirst ? undefined : handleBack}
        onNext={handleNext}
        nextLabel={isLastStep && isLastSubstep ? submitLabel : "Next"}
        isNextDisabled={isNextDisabled}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default MultiStepLayout;
