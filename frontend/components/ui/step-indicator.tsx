import React from "react";
import { cn } from "@/lib/utils";

export interface Step {
  label: string;
  path?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

function ChevronRight() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 text-muted-foreground"
    >
      <path
        d="M5.25 3.5L8.75 7L5.25 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <nav className={cn("flex items-center gap-3", className)}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        return (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight />}
            <div className="flex items-center gap-1">
              <div className="flex items-center justify-center size-[26px] rounded-full bg-secondary">
                <span
                  className={cn(
                    "text-base font-medium leading-normal tracking-tight",
                    isActive
                      ? "text-secondary-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {index + 1}
                </span>
              </div>
              <span
                className={cn(
                  "text-sm leading-5",
                  isActive
                    ? "text-secondary-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export { StepIndicator };
