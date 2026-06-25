"use client";

import { type ReactNode, useState } from "react";
import { StepIndicator } from "@/common/components/ui/step-indicator";
import { Header, Footer } from "@/common/components/forms";
import { cn } from "@/common/lib/utils";

type ContentPadding = "default" | "tight" | "none";

export interface Substep {
  label: string;
  content: ReactNode;
  leftAction?: ReactNode;
  /** Use the full container width instead of the default centered, reading-width column. */
  wide?: boolean;
  /** Adjusts the page-level padding around the content. Defaults to "default". */
  contentPadding?: ContentPadding;
  /** Applies sizing or spacing to this substep's content section. */
  contentClassName?: string;
  /** Applies sizing or spacing to the wrapper immediately around this substep's content. */
  contentBodyClassName?: string;
}

export interface Step {
  label: string;
  substeps: Substep[];
}

const CONTENT_PADDING_CLASSES: Record<ContentPadding, string> = {
  default: "px-10xl py-xl",
  tight: "px-7xl pt-7xl pb-xl",
  none: "",
};

type MultiStepLayoutProps = {
  steps: Step[];
  flowTitle?: string;
  onSubmit: () => void;
  isSubmitting?: boolean;
  isNextDisabled?: boolean;
  footerAlert?: string;
  submitLabel?: string;
  /**
   * Controlled step/substep index, for flows that need to jump to an
   * arbitrary step from outside (e.g. a Review screen's "edit" links).
   * Omit both `stepIndex` and `onNavigate` to let the layout manage its
   * own navigation state internally (the default, uncontrolled mode).
   */
  stepIndex?: number;
  substepIndex?: number;
  onNavigate?: (next: { stepIndex: number; substepIndex: number }) => void;
  /**
   * Called before advancing to the next substep/step or submitting.
   * Return `false` to block the navigation (e.g. validation failed) —
   * the layout will not advance and `onSubmit` will not fire.
   */
  onBeforeNext?: () => boolean;
  /** Overrides the root container's width/layout classes (defaults to `max-w-7xl`). */
  className?: string;
  /** Applies layout-level sizing or spacing to the active step content container. */
  contentClassName?: string;
};

function MultiStepLayout({
  steps,
  flowTitle,
  onSubmit,
  isSubmitting = false,
  isNextDisabled = false,
  footerAlert,
  submitLabel = "Submit",
  stepIndex: controlledStepIndex,
  substepIndex: controlledSubstepIndex,
  onNavigate,
  onBeforeNext,
  className,
  contentClassName,
}: MultiStepLayoutProps) {
  const isControlled = controlledStepIndex !== undefined;
  const [internalStepIndex, setInternalStepIndex] = useState(0);
  const [internalSubstepIndex, setInternalSubstepIndex] = useState(0);

  const stepIndex = isControlled ? controlledStepIndex : internalStepIndex;
  const substepIndex = isControlled
    ? (controlledSubstepIndex ?? 0)
    : internalSubstepIndex;

  const navigate = (nextStepIndex: number, nextSubstepIndex: number) => {
    if (isControlled) {
      onNavigate?.({
        stepIndex: nextStepIndex,
        substepIndex: nextSubstepIndex,
      });
    } else {
      setInternalStepIndex(nextStepIndex);
      setInternalSubstepIndex(nextSubstepIndex);
    }
  };

  const step = steps[stepIndex];
  const substep = step.substeps[substepIndex];
  const isFirst = stepIndex === 0 && substepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;
  const isLastSubstep = substepIndex === step.substeps.length - 1;

  const handleNext = () => {
    if (onBeforeNext && !onBeforeNext()) return;

    if (isLastStep && isLastSubstep) {
      onSubmit();
      return;
    }
    if (isLastSubstep) {
      navigate(stepIndex + 1, 0);
      return;
    }
    navigate(stepIndex, substepIndex + 1);
  };

  const handleBack = () => {
    if (substepIndex > 0) {
      navigate(stepIndex, substepIndex - 1);
      return;
    }
    if (stepIndex > 0) {
      const previousStep = steps[stepIndex - 1];
      navigate(stepIndex - 1, previousStep.substeps.length - 1);
    }
  };

  return (
    <div
      className={cn(
        "mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center gap-9",
        className
      )}
    >
      <Header>
        <StepIndicator
          steps={steps.map((s) => ({ label: s.label }))}
          currentStep={stepIndex}
          className="flex-wrap justify-center"
        />
      </Header>

      <div
        data-testid="multi-step-content"
        className={cn(
          "mx-auto flex w-[100%] flex-col gap-8 bg-background",
          CONTENT_PADDING_CLASSES[substep.contentPadding ?? "default"],
          substep.wide ? "max-w-none" : "max-w-7xl",
          contentClassName,
          substep.contentClassName
        )}
      >
        {flowTitle ? (
          <h1 className="text-xl font-semibold text-foreground">{flowTitle}</h1>
        ) : null}
        {substep.label ? (
          <h2 className="text-lg font-semibold text-foreground">
            {substep.label}
          </h2>
        ) : null}
        <div className={substep.contentBodyClassName}>{substep.content}</div>
      </div>

      <Footer
        className="mt-auto w-full"
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
