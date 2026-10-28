"use client";

import { Check, ChevronRight, X } from "lucide-react";
import { AgentHover, type AgentHoverProps } from "@/common/components/agents";
import {
  ApprovalsLabel,
  PartiallyReviewedBadge,
  PendingReviewBadge,
  RejectedBadge,
} from "@/common/components/status-labels";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";
import { TooltipProvider } from "@/common/components/ui/tooltip";
import { cn } from "@/common/lib/utils";
import { StockItemChip } from "./StockItemChip";

// TYPES
type ReferralCardStateProps =
  | { status: "pending"; onReject: () => void; onWaitlist: () => void }
  | { status: "pending-review" | "partially-reviewed" }
  | {
      status: "reviewed";
      /** Items approved so far - renders the "2/4 Approved" label. */
      approvedCount: number;
      totalCount: number;
      /** Grey "Incomplete scheduling" chip. */
      hasIncompleteScheduling?: boolean;
    }
  | { status: "rejected"; rejectionReason: string };

export type ReferralStatus = ReferralCardStateProps["status"];

export type ReferralCardAgent = Pick<
  AgentHoverProps,
  "firstName" | "lastName" | "role" | "imageUrl"
>;

export type ReferralCardItem = {
  id: string;
  name: string;
  /** Quantity requested. */
  quantity: number;
  /** Quantity currently in stock. */
  stock: number;
};

type ReferralCardBaseProps = {
  clientName: string;
  referralId: string;
  submittedAt: string;
  previousSubmissionAt?: string;
  agents: ReferralCardAgent[];
  errorMsg?: string;
  isPriority?: boolean;
  /** Requested items with stock chips. */
  items?: ReferralCardItem[];
  onViewDetails?: () => void;
  className?: string;
};

export type ReferralCardProps = ReferralCardBaseProps & ReferralCardStateProps;

// CONFIG
const DEFAULT_DETAILS_LABEL: Record<ReferralStatus, string> = {
  pending: "View details",
  "pending-review": "Review referral",
  "partially-reviewed": "Review referral",
  reviewed: "Review referral",
  rejected: "View details",
};

// SMALLER COMPONENTS
function ReferralStatusBadge(props: ReferralCardStateProps) {
  switch (props.status) {
    case "pending":
      // TODO: switch to pending badge
      return (
        <Badge className="rounded-lg font-normal border-transparent bg-amber-100 text-amber-900">
          Pending
        </Badge>
      );
    case "pending-review":
      return <PendingReviewBadge />;
    case "partially-reviewed":
      return <PartiallyReviewedBadge />;
    case "reviewed":
      return (
        <ApprovalsLabel
          approved={props.approvedCount}
          total={props.totalCount}
        />
      );
    case "rejected":
      return <RejectedBadge />;
  }
}

// CARD
export function ReferralCard(props: ReferralCardProps) {
  const {
    clientName,
    referralId,
    submittedAt,
    previousSubmissionAt,
    agents,
    errorMsg = "",
    isPriority = false,
    items,
    onViewDetails,
    className,
  } = props;

  const showPriority = isPriority && props.status !== "rejected";
  const detailsLabel = DEFAULT_DETAILS_LABEL[props.status];

  return (
    <Card
      className={cn(
        "w-full flex-row items-center justify-between gap-md rounded-lg p-md",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-md">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xl truncate font-semibold text-foreground">
            {clientName}
          </p>
          <span className="text-base font-medium leading-6 text-foreground uppercase">
            {referralId}
          </span>
          <ReferralStatusBadge {...props} />
          {showPriority ? (
            // TODO: switch to priority badge component when exists
            <Badge className="h-6 gap-1.5 rounded-full border-transparent bg-red-50 px-sm font-medium text-orange-600 uppercase">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-orange-600"
              />
              Priority
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-col gap-sm">
          <div className="flex flex-wrap items-center gap-sm text-paragraph-small">
            <TooltipProvider>
              <div
                className="flex items-center gap-2.5"
                role="group"
                aria-label="Assigned agents"
              >
                {agents.map((agent) => (
                  <AgentHover
                    key={`${agent.role}-${agent.firstName}-${agent.lastName}`}
                    {...agent}
                  />
                ))}
              </div>
            </TooltipProvider>
            <span className="text-foreground">Submitted {submittedAt}</span>
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
          {errorMsg ? (
            <p className="text-(--unofficial-destructive-text)">{errorMsg}</p>
          ) : null}
        </div>

        {props.status === "rejected" ? (
          <p className="text-paragraph-small text-foreground">
            Reason for rejection: {props.rejectionReason}
          </p>
        ) : null}

        {items && items.length > 0 ? (
          <ul className="flex flex-wrap gap-xs" aria-label="Requested items">
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

        {props.status === "reviewed" && props.hasIncompleteScheduling ? (
          <div>
            <Badge
              variant="secondary"
              className="h-auto rounded-lg border-none bg-(--unofficial-border-0) px-sm py-1 text-paragraph-small leading-5 font-medium"
            >
              Incomplete scheduling
            </Badge>
          </div>
        ) : null}

        {props.status === "pending" ? (
          <div className="flex items-center gap-3">
            <Button type="button" variant="secondary" onClick={props.onReject}>
              <X aria-hidden="true" />
              Reject
            </Button>
            <Button type="button" onClick={props.onWaitlist}>
              <Check aria-hidden="true" />
              Waitlist
            </Button>
          </div>
        ) : null}
      </div>

      {onViewDetails ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onViewDetails}
          aria-label={`${detailsLabel} for ${clientName}`}
          className="shrink-0"
        >
          {detailsLabel}
          <ChevronRight aria-hidden="true" />
        </Button>
      ) : null}
    </Card>
  );
}
