import { Check, ChevronRight, CircleAlert, X } from "lucide-react";
import type { ComponentType } from "react";

import { AgentHover } from "@/common/components/agents";
import { StockItemChip } from "@/common/components/data-display";
import { Avatar, AvatarFallback } from "@/common/components/ui/avatar";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";
import {
  PartiallyReviewedBadge,
  PendingReviewBadge,
  RejectedBadge,
} from "@/common/components/status-labels";
import { TooltipProvider } from "@/common/components/ui/tooltip";
import { cn } from "@/common/lib/utils";

// TYPES
export type ReferralStatus =
  | "pending"
  | "pending-review"
  | "waitlisted"
  | "rejected";

export type ReferralCardAgent = {
  firstName: string;
  lastName: string;
  role?: string;
};

export type ReferralCardItem = {
  id: string;
  name: string;
  /** Quantity requested. */
  quantity: number;
  /** Quantity currently in stock. */
  stock: number;
};

export type ReferralCardProps = {
  status: ReferralStatus;
  clientName: string;
  referralId: string;
  submittedAt: string;
  previousSubmissionAt?: string;
  agents: ReferralCardAgent[];

  isPriority?: boolean;
  priorityDescription?: string;

  /** Red warning line under the meta row. */
  hasUnfulfillableItems?: boolean;
  unfulfillableMessage?: string;

  /** Requested items with stock chips. */
  items?: ReferralCardItem[];

  /** Shown on rejected referrals. */
  rejectionReason?: string;

  /** Reject / Waitlist buttons only render for `pending` when handlers exist. */
  onReject?: () => void;
  onWaitlist?: () => void;

  /** Right-hand link. Omit the handler to hide it. */
  onViewDetails?: () => void;
  /** Defaults to "Review referral" for pending-review, otherwise "View details". */
  viewDetailsLabel?: string;

  className?: string;
};

// CONFIG
const STATUS_CONFIG: Record<
  ReferralStatus,
  { StatusBadge: ComponentType; defaultDetailsLabel: string }
> = {
  pending: {
    StatusBadge: PendingReviewBadge,
    defaultDetailsLabel: "View details",
  },
  "pending-review": {
    StatusBadge: PendingReviewBadge,
    defaultDetailsLabel: "Review referral",
  },
  waitlisted: {
    StatusBadge: PartiallyReviewedBadge,
    defaultDetailsLabel: "View details",
  },
  rejected: {
    StatusBadge: RejectedBadge,
    defaultDetailsLabel: "View details",
  },
};

// SMALLER COMPONENTS
function AgentAvatar({ agent }: { agent: ReferralCardAgent }) {
  const role = agent.role?.toLowerCase().includes("secondary")
    ? "secondary"
    : agent.role?.toLowerCase().includes("primary")
      ? "primary"
      : null;
  const initials =
    `${agent.firstName.charAt(0)}${agent.lastName.charAt(0)}`.toUpperCase();

  if (role) {
    return (
      <AgentHover
        firstName={agent.firstName}
        lastName={agent.lastName}
        role={role}
      />
    );
  }

  return (
    <Avatar
      aria-label={[agent.firstName, agent.lastName, agent.role]
        .filter(Boolean)
        .join(", ")}
    >
      <AvatarFallback className="bg-neutral-200 text-xs font-semibold text-black">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

// CARD
export default function ReferralCard({
  status,
  clientName,
  referralId,
  submittedAt,
  previousSubmissionAt,
  agents,
  isPriority = false,
  priorityDescription,
  hasUnfulfillableItems = false,
  unfulfillableMessage = "This request has items that can't be fully fulfilled right now.",
  items,
  rejectionReason,
  onReject,
  onWaitlist,
  onViewDetails,
  viewDetailsLabel,
  className,
}: ReferralCardProps) {
  const config = STATUS_CONFIG[status];
  const { StatusBadge } = config;
  const showPriority = isPriority && status !== "rejected";
  const showActions = status === "pending" && (onReject || onWaitlist);

  return (
    <TooltipProvider delay={0}>
      <Card
        className={cn(
          "w-full flex-row items-center justify-between gap-2 rounded-lg p-4",
          className
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-3">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-xl font-semibold text-secondary-foreground">
                {clientName}
              </h3>
              <span className="text-base font-medium uppercase text-secondary-foreground">
                Referral ID {referralId}
              </span>
              <StatusBadge />
              {showPriority ? (
                <Badge
                  variant="secondary"
                  className="gap-1.5 rounded-3xl bg-red-50 text-sm font-medium uppercase text-orange-600 hover:bg-red-50"
                  title={priorityDescription}
                >
                  <span
                    aria-hidden="true"
                    className="size-1.25 rounded-full bg-orange-600"
                  />
                  Priority
                </Badge>
              ) : null}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div
                className="h-8 inline-flex items-center justify-start gap-2.5 px-2 py-2"
                role="group"
                aria-label="Assigned agents"
              >
                {agents.map((agent, index) => (
                  <AgentAvatar
                    key={`${agent.firstName}-${agent.lastName}-${index}`}
                    agent={agent}
                  />
                ))}
              </div>
              <span className="text-foreground text-sm font-normal leading-5">
                Submitted {submittedAt}
              </span>
              {previousSubmissionAt ? (
                <>
                  <span aria-hidden="true" className="text-muted-foreground">
                    •
                  </span>
                  <span className="text-muted-foreground">
                    Previous Submission {previousSubmissionAt}
                  </span>
                </>
              ) : null}
            </div>

            {hasUnfulfillableItems ? (
              <p className="flex items-start gap-3 text-sm font-medium text-destructive">
                <CircleAlert
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                {unfulfillableMessage}
              </p>
            ) : null}

            {status === "rejected" && rejectionReason ? (
              <p className="text-sm text-foreground">
                Reason for rejection: {rejectionReason}
              </p>
            ) : null}

            {items && items.length > 0 ? (
              <ul className="flex flex-wrap gap-2" aria-label="Requested items">
                {items.map((item) => (
                  <li key={item.id}>
                    <StockItemChip
                      name={item.name}
                      quantity={item.quantity}
                      stock={item.stock}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {showActions ? (
            <div className="flex items-center gap-3">
              {onReject ? (
                <Button type="button" variant="secondary" onClick={onReject}>
                  <X className="size-4" aria-hidden="true" />
                  Reject
                </Button>
              ) : null}
              {onWaitlist ? (
                <Button type="button" onClick={onWaitlist}>
                  <Check className="size-4" aria-hidden="true" />
                  Waitlist
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        {onViewDetails ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onViewDetails}
            className="shrink-0"
          >
            {viewDetailsLabel ?? config.defaultDetailsLabel}
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </Card>
    </TooltipProvider>
  );
}
