import { CircleAlert } from "lucide-react";

import { cn } from "@/common/lib/utils";

interface ServiceAreaNoticeProps {
  className?: string;
}

function ServiceAreaNotice({ className }: ServiceAreaNoticeProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-3 text-sm",
        className
      )}
      role="note"
    >
      <CircleAlert
        aria-hidden="true"
        className="size-4 shrink-0 text-foreground"
      />
      <span className="font-medium">
        Home Again Furniture Bank currently serves only the Northeast Avalon region of Newfoundland and Labrador, Canada.
      </span>
    </div>
  );
}

export { ServiceAreaNotice };
