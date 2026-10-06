import type { ReactNode } from "react";

import { cn } from "@/common/lib/utils";

interface InformationBlockProps {
  label: string;
  value: ReactNode;
  className?: string;
  labelAction?: ReactNode;
}

function InformationBlock({
  label,
  value,
  className,
  labelAction,
}: InformationBlockProps) {
  return (
    <div
      className={cn("flex flex-col items-start gap-1 self-stretch", className)}
    >
      <div className="flex items-center gap-1.5">
        <p className="text-paragraph-small font-medium text-foreground">
          {label}
        </p>
        {labelAction}
      </div>
      <p className="min-w-0 break-words text-paragraph-small text-muted-foreground">
        {value}
      </p>
    </div>
  );
}

export { InformationBlock };
