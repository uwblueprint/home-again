import { Badge } from "@/common/components/ui/badge";
import { cn } from "@/common/lib/utils";

import type { ReferralStatus } from "../data/mockReferrals";

const STATUS_STYLES: Record<ReferralStatus, string> = {
  Pending: "border-transparent bg-amber-100 text-amber-900",
  Delivered: "border-transparent bg-green-100 text-green-900",
  Scheduled: "border-transparent bg-blue-100 text-blue-900",
  Rejected: "border-transparent bg-red-100 text-red-900",
};

type ReferralStatusBadgeProps = {
  status: ReferralStatus;
  statusDate?: string;
  className?: string;
};

export function ReferralStatusBadge({
  status,
  statusDate,
  className,
}: ReferralStatusBadgeProps) {
  const label = statusDate ? `${status} ${statusDate}` : status;

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
