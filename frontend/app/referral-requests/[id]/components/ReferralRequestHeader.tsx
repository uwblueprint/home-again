import {
  PendingReviewBadge,
  PartiallyReviewedBadge,
  ReviewedBadge,
  RejectedBadge,
  PriorityBadge,
} from "@/common/components/status-labels";
import type { ReferralRequestPreview } from "@/app/referral-requests/[id]/types";

export function ReferralRequestHeader({
  request,
}: {
  request: ReferralRequestPreview;
}) {
  const submittedAt = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(request.submittedAt));

  return (
    <header className="flex flex-wrap items-start justify-between gap-lg">
      <div className="flex min-w-0 flex-col gap-lg">
        <h1 className="text-heading-2 font-semibold leading-8 text-foreground">
          Referral Request
        </h1>
        <p className="flex flex-wrap items-center gap-md text-paragraph-regular text-muted-foreground">
          <span className="break-all">{request.id}</span>
          <span aria-hidden="true">·</span>
          <span>
            Submitted <time dateTime={request.submittedAt}>{submittedAt}</time>
          </span>
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-xl">
        {request.isPriority && <PriorityBadge />}
        {request.isNew ? (
          <PendingReviewBadge text="Pending Approval" />
        ) : request.status === "rejected" ? (
          <RejectedBadge />
        ) : request.status === "reviewed" ? (
          <ReviewedBadge />
        ) : request.status === "partially-reviewed" ? (
          <PartiallyReviewedBadge />
        ) : (
          <PendingReviewBadge />
        )}
      </div>
      {request.isPriority && request.priorityDescription?.trim() && (
        <p className="w-full break-words text-paragraph-small text-muted-foreground">
          Priority Reason: {request.priorityDescription}
        </p>
      )}
    </header>
  );
}
