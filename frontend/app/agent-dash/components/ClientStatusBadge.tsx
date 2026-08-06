import { Badge } from "@/common/components/ui/badge";
import { cn } from "@/common/lib/utils";

import type { ClientStatus } from "../data/mockClients";

const STATUS_STYLES: Record<ClientStatus, string> = {
  "Referral Pending": "border-transparent bg-amber-100 text-amber-900",
  "Referral Scheduled": "border-transparent bg-blue-100 text-blue-900",
  Eligible: "border-transparent bg-green-100 text-green-900",
  "Not Eligible": "border-transparent bg-red-100 text-red-900",
};

type ClientStatusBadgeProps = {
  status: ClientStatus;
  statusDate?: string;
  className?: string;
};

export function ClientStatusBadge({
  status,
  statusDate,
  className,
}: ClientStatusBadgeProps) {
  const label =
    status === "Referral Scheduled" && statusDate
      ? `${status} ${statusDate}`
      : status;

  return (
    <Badge
      className={cn(
        "rounded-lg px-xs py-[2px] font-normal",
        STATUS_STYLES[status],
        className
      )}
    >
      {label}
    </Badge>
  );
}
