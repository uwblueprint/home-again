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

export type BreadcrumbStep = {
  label: string;
  current?: boolean;
};

type MultiStepLayoutProps = {
  onNext: () => void;
  onBack?: () => void;
  isSubmitting?: boolean;
  isNextDisabled?: boolean;
  footerAlert?: string;
  title: string;
  showTitle?: boolean;
  breadcrumbs?: BreadcrumbStep[];
  breadcrumbLabels?: string[];
  activeBreadcrumbIndex?: number;
  nextLabel?: string;
  children: React.ReactNode;
};

function MultiStepLayout({
  title,
  showTitle = true,
  breadcrumbs,
  breadcrumbLabels,
  activeBreadcrumbIndex = 0,
  onNext,
  onBack,
  isSubmitting = false,
  isNextDisabled = false,
  footerAlert,
  nextLabel = "Next",
  children,
}: MultiStepLayoutProps) {
  const resolvedBreadcrumbs: BreadcrumbStep[] = React.useMemo(() => {
    if (breadcrumbLabels?.length) {
      return breadcrumbLabels.map((label, idx) => ({
        label,
        current: idx === activeBreadcrumbIndex,
      }));
    }
    return breadcrumbs ?? [];
  }, [breadcrumbLabels, activeBreadcrumbIndex, breadcrumbs]);

  const activeIndex = React.useMemo(() => {
    if (breadcrumbLabels?.length) {
      return Math.min(
        Math.max(activeBreadcrumbIndex, 0),
        Math.max(resolvedBreadcrumbs.length - 1, 0)
      );
    }
    const explicit = resolvedBreadcrumbs.findIndex((crumb) => crumb.current);
    return explicit >= 0 ? explicit : 0;
  }, [activeBreadcrumbIndex, breadcrumbLabels, resolvedBreadcrumbs]);

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
            {resolvedBreadcrumbs.map((crumb, index) => {
              const isActive = index === activeIndex;

              return (
                <React.Fragment key={`${crumb.label}-${index}`}>
                  <BreadcrumbItem className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full bg-neutral-100",
                        "w-[26px] h-[26px] px-[10px] py-[5px] flex-col gap-[10px] aspect-square",
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
                      {crumb.label}
                    </span>
                  </BreadcrumbItem>
                  {index < resolvedBreadcrumbs.length - 1 && (
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
                variant="ghost"
                onClick={onBack}
                data-testid="back-button"
                className={cn(
                  "flex min-h-[40px] items-center justify-center gap-2",
                  "px-6 py-2.5",
                  "rounded-lg bg-neutral-100",
                  "text-sm text-muted-foreground hover:bg-neutral-200 hover:text-foreground"
                )}
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
              className={cn(
                "flex min-h-[40px] items-center justify-center gap-2",
                "px-6 py-2.5",
                "rounded-lg bg-[#9E4876] text-primary-foreground",
                "hover:bg-[#9E4876]/90"
              )}
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
