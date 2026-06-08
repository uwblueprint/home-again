"use client";

import * as React from "react";
import { FormBreadcrumb } from "@/common/components/forms";
import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";

export type BreadcrumbStep = {
  label: string;
  current?: boolean;
};

type ReferralLayoutProps = {
  onNext: () => void;
  onBack?: () => void;
  isSubmitting?: boolean;
  title: string;
  activeIndex: number;
  breadcrumbs?: BreadcrumbStep[];
  nextLabel?: string;
  children: React.ReactNode;
};

function ReferralLayout({
  title,
  breadcrumbs,
  activeIndex,
  onNext,
  onBack,
  isSubmitting = false,
  nextLabel = "Next",
  children,
}: ReferralLayoutProps) {
  const steps = React.useMemo(
    () => breadcrumbs?.map((crumb) => ({ label: crumb.label })) ?? [],
    [breadcrumbs]
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center gap-6 px-4 pb-4 pt-12">
      <header
        className={cn(
          "w-screen max-w-none px-4",
          "-mx-[calc((100vw-100%)/2)]",
          "flex flex-col items-center gap-3"
        )}
      >
        <FormBreadcrumb steps={steps} activeIndex={activeIndex} />
      </header>
      <div className="flex w-full flex-col gap-6 rounded-xl border border-border bg-background p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>

        <div>{children}</div>
      </div>

      <nav
        className={cn(
          "mt-auto w-screen max-w-none",
          "-mx-[calc((100vw-100%)/2)]",
          "border-t border-border bg-background/90 px-4 py-3 pb-6"
        )}
      >
        <div className="ml-auto mr-4 flex w-full max-w-3xl items-center justify-end gap-2">
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
            disabled={isSubmitting}
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
      </nav>
    </div>
  );
}

export default ReferralLayout;
