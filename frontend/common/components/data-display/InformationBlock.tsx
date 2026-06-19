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
      className={cn(
        "flex flex-col items-start gap-sm self-stretch",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {labelAction}
      </div>
      <p className="min-w-0 break-words text-sm text-muted-foreground">
        {value}
      </p>
    </div>
  );
}

export { InformationBlock };
