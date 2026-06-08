"use client";

import { Fragment } from "react";
import { ChevronRightIcon } from "lucide-react";

import {
  BreadcrumbItem,
  BreadcrumbLabel,
  BreadcrumbNumber,
} from "@/common/components/ui/breadcrumb";
import { cn } from "@/common/lib/utils";

export type FormBreadcrumbStep = {
  label: string;
};

export type FormBreadcrumbProps = {
  steps: FormBreadcrumbStep[];
  activeIndex?: number;
  className?: string;
};

function FormBreadcrumbSeparator() {
  return (
    <li
      data-slot="form-breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className="text-muted-foreground [&>svg]:size-3.5"
    >
      <ChevronRightIcon />
    </li>
  );
}

function FormBreadcrumb({
  steps,
  activeIndex,
  className,
}: FormBreadcrumbProps) {
  return (
    <nav aria-label="Form steps" className={cn("w-full", className)}>
      <ol
        data-slot="form-breadcrumb-list"
        className="mx-auto flex flex-wrap items-center justify-center gap-3 break-words text-muted-foreground"
      >
        {steps.map((step, index) => {
          const isCurrent = activeIndex === index;
          return (
            <Fragment key={`${step.label}-${index}`}>
              <BreadcrumbItem>
                <BreadcrumbNumber current={isCurrent}>
                  {index + 1}
                </BreadcrumbNumber>
                <BreadcrumbLabel current={isCurrent}>
                  {step.label}
                </BreadcrumbLabel>
              </BreadcrumbItem>
              {index < steps.length - 1 && <FormBreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

export { FormBreadcrumb };
