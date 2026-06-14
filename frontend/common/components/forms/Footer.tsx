import { AlertCircle } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";
import type { VariantProps } from "class-variance-authority";

import { buttonVariants } from "@/common/components/ui/button";

interface FooterProps {
  leftAction?: React.ReactNode;
  footerAlert?: string;
  onBack?: () => void;
  isBackDisabled?: boolean;
  backVariant?: VariantProps<typeof buttonVariants>["variant"];
  onNext: () => void;
  nextLabel?: string;
  submittingLabel?: string;
  isNextDisabled?: boolean;
  isSubmitting?: boolean;
  className?: string;
}

export function Footer({
  leftAction,
  footerAlert,
  onBack,
  isBackDisabled = false,
  backVariant = "outline",
  onNext,
  nextLabel = "Next",
  submittingLabel = "Loading...",
  isNextDisabled = false,
  isSubmitting = false,
  className,
}: FooterProps) {
  return (
    <nav
      className={cn(
        "w-[50vw] border-t border-border bg-background/90 px-4 py-3 pb-6 md:px-8",
        className
      )}
    >
      <div className="grid w-full grid-cols-[1fr_auto] items-center gap-2">
        <div className="flex items-center gap-3 justify-self-start text-left text-sm">
          {footerAlert ? (
            <span className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              {footerAlert}
            </span>
          ) : null}
          {leftAction}
        </div>
        <div className="flex items-center justify-end gap-2">
          {onBack ? (
            <Button
              type="button"
              variant={backVariant}
              onClick={onBack}
              disabled={isBackDisabled}
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
            {isSubmitting ? submittingLabel : nextLabel}
          </Button>
        </div>
      </div>
    </nav>
  );
}
