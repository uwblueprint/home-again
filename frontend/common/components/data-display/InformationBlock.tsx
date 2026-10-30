import type { ReactNode } from "react";

import { cn } from "@/common/lib/utils";

interface InformationBlockProps {
  label: string;
  value: ReactNode;
  className?: string;
  labelAction?: ReactNode;
  /** Rendered beside the value (e.g. a copy button). Sits outside the value <p>. */
  valueAction?: ReactNode;
}

function InformationBlock({
  label,
  value,
  className,
  labelAction,
  valueAction,
}: InformationBlockProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-start gap-1 self-stretch",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <p className="text-paragraph-small font-medium text-foreground">
          {label}
        </p>
        {labelAction}
      </div>
      <div className="flex min-w-0 max-w-full items-center gap-1.5">
        <p className="min-w-0 text-paragraph-small text-muted-foreground [overflow-wrap:anywhere]">
          {value}
        </p>
        {valueAction}
      </div>
    </div>
  );
}

export { InformationBlock };
