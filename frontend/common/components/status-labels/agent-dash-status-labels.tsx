import { Badge } from "@/common/components/ui/badge";
import { cn } from "@/common/lib/utils";

// ── Agent Dashboard Status Labels ─────────────────────────────────────────────
// Covers referral statuses, client statuses, and agency agent roles.

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-900",
  "Referral Pending": "bg-amber-100 text-amber-900",
  Scheduled: "bg-blue-100 text-blue-900",
  "Referral Scheduled": "bg-blue-100 text-blue-900",
  Delivered: "bg-green-100 text-green-900",
  Eligible: "bg-green-100 text-green-900",
  Rejected: "bg-red-100 text-red-900",
  "Not Eligible": "bg-red-100 text-red-900",
  Agent: "bg-sky-100 text-sky-900",
  Admin: "bg-purple-100 text-purple-900",
};

export type AgentDashStatus = keyof typeof STATUS_STYLES;

interface AgentDashStatusBadgeProps {
  status: AgentDashStatus;
  /** Appended after the status, e.g. "Delivered Mar 14". */
  date?: string;
  className?: string;
}

export function AgentDashStatusBadge({
  status,
  date,
  className,
}: AgentDashStatusBadgeProps) {
  return (
    <Badge
      className={cn(
        "rounded-[8px] border-transparent px-xs py-[2px] font-normal",
        STATUS_STYLES[status],
        className
      )}
    >
      {date ? `${status} ${date}` : status}
    </Badge>
  );
}
