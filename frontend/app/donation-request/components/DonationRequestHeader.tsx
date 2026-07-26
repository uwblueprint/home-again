"use client";

import { CalendarDays } from "lucide-react";

import { Button } from "@/common/components/ui/button";
import {
  ApprovalsLabel,
  PartiallyReviewedBadge,
  PendingReviewBadge,
  ScheduledBadge,
} from "@/common/components/status-labels";
import { formatDate, formatShortDate } from "@/common/utils/DateUtils";
import type { DonationRequest, ReviewStatus } from "./types";

interface DonationRequestHeaderProps {
  request: DonationRequest;
  reviewStatus: ReviewStatus;
  approvedCount: number;
  totalItems: number;
  onSchedulePickup: () => void;
}

function ReviewStatusIndicator({
  request,
  reviewStatus,
  approvedCount,
  totalItems,
  onSchedulePickup,
}: DonationRequestHeaderProps) {
  switch (reviewStatus) {
    case "pending_review":
      return <PendingReviewBadge />;
    case "partially_reviewed":
      return <PartiallyReviewedBadge />;
    case "reviewed":
      return (
        <div className="flex items-center gap-md">
          <Button variant="outline" onClick={onSchedulePickup}>
            Schedule Pickup
            <CalendarDays />
          </Button>
          <ApprovalsLabel approved={approvedCount} total={totalItems} />
        </div>
      );
    case "scheduled":
      return (
        <ScheduledBadge
          date={
            request.pickup?.scheduled_date
              ? formatShortDate(request.pickup.scheduled_date)
              : undefined
          }
        />
      );
  }
}

function DonationRequestHeader(props: DonationRequestHeaderProps) {
  const { request } = props;
  return (
    <div className="flex items-start justify-between gap-lg">
      <div className="flex flex-col gap-sm">
        <h1 className="text-heading-2 font-semibold text-foreground">
          Donation Request
        </h1>
        <div className="flex items-center gap-sm text-paragraph-small text-muted-foreground">
          <span>{request.request_id}</span>
          <span aria-hidden="true">·</span>
          <span>Submitted {formatDate(request.submitted_at)}</span>
        </div>
      </div>
      <div className="pt-1">
        <ReviewStatusIndicator {...props} />
      </div>
    </div>
  );
}

export { DonationRequestHeader };
