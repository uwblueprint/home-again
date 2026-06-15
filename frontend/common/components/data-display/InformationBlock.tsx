import type { ReactNode } from "react";

import { cn } from "@/common/lib/utils";

interface InformationBlockProps {
  label: string;
  value: ReactNode;
  className?: string;
}

function InformationBlock({ label, value, className }: InformationBlockProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-sm self-stretch",
        className
      )}
    >
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="min-w-0 break-words text-sm text-muted-foreground">
        {value}
      </p>
    </div>
  );
}

export { InformationBlock };
