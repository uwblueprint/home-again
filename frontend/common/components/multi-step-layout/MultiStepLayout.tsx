"use client";

import * as React from "react";
import {
  Breadcrumb as BreadcrumbNav,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/common/components/ui/breadcrumb";
import { AlertCircle } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";

type MultiStepLayoutProps = {
  onNext: () => void;
  onBack?: () => void;
  isSubmitting?: boolean;
  isNextDisabled?: boolean;
  footerAlert?: string;
  title: string;
  showTitle?: boolean;
  breadcrumbLabels?: string[];
  activeBreadcrumbIndex?: number;
  nextLabel?: string;
  children: React.ReactNode;
};

function MultiStepLayout({
  title,
  showTitle = true,
  breadcrumbLabels = [],
  activeBreadcrumbIndex = 0,
  onNext,
  onBack,
  isSubmitting = false,
  isNextDisabled = false,
  footerAlert,
  nextLabel = "Next",
  children,
}: MultiStepLayoutProps) {
  const activeIndex = Math.min(
    Math.max(activeBreadcrumbIndex, 0),
    Math.max(breadcrumbLabels.length - 1, 0)
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center gap-6 px-4 pb-4 pt-12">
      <header
        className={cn(
          "w-screen max-w-none px-4",
          "-mx-[calc((100vw-100%)/2)]",
          "flex flex-col items-center gap-3"
        )}
      >
        <BreadcrumbNav
          className={cn(
            "w-full",
            "text-sm leading-5 tracking-normal",
            "font-sans text-muted-foreground"
          )}
        >
          <BreadcrumbList className="mx-auto flex flex-wrap items-center justify-center gap-3">
            {breadcrumbLabels.map((label, index) => {
              const isActive = index === activeIndex;

              return (
                <React.Fragment key={`${label}-${index}`}>
                  <BreadcrumbItem className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex size-6.5 items-center justify-center rounded-full bg-neutral-100",
                        "text-[16px] leading-[150%] tracking-[-0.176px] font-medium text-muted-foreground",
                        isActive && "text-foreground"
                      )}
                      aria-current={isActive ? "step" : undefined}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={cn(
                        "text-muted-foreground",
                        isActive && "text-foreground"
                      )}
                    >
                      {label}
                    </span>
                  </BreadcrumbItem>
                  {index < breadcrumbLabels.length - 1 && (
                    <BreadcrumbSeparator />
                  )}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </BreadcrumbNav>
      </header>

      <div className="mt-4 flex w-full flex-col gap-6 bg-background">
        {showTitle ? (
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        ) : null}

        <div>{children}</div>
      </div>

      <nav
        className={cn(
          "mt-auto w-full max-w-7xl",
          "mx-auto",
          "border-t border-border bg-background/90 py-3 pb-6"
        )}
      >
        <div className="grid w-full grid-cols-[1fr_auto] items-center gap-2">
          {footerAlert ? (
            <div className="flex items-center gap-2 justify-self-start text-left text-sm text-destructive">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <span>{footerAlert}</span>
            </div>
          ) : (
            <span />
          )}
          <div className="flex items-center justify-end gap-2">
            {onBack ? (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                data-testid="back-button"
                className="min-h-10 px-6 py-2.5"
              >
                Back
              </Button>
            ) : null}

            <Button
              type="button"
              onClick={onNext}
              disabled={isSubmitting || isNextDisabled}
              data-testid="next-button"
              aria-busy={isSubmitting}
              className="min-h-10 px-6 py-2.5"
            >
              {isSubmitting ? "Loading..." : nextLabel}
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default MultiStepLayout;
