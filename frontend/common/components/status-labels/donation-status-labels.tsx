import { Badge } from "@/common/components/ui/badge";

// ── Donation Status Labels ────────────────────────────────────────────────────
export function ReviewedBadge() {
  return (
    <Badge className="rounded-lg font-normal border-transparent bg-lime-100 text-lime-900">
      Reviewed
    </Badge>
  );
}

export function PendingReviewBadge() {
  return (
    <Badge className="rounded-lg font-normal border-transparent bg-amber-100 text-amber-900">
      Pending Review
    </Badge>
  );
}

export function PartiallyReviewedBadge() {
  return (
    <Badge className="rounded-lg font-normal border-transparent bg-sky-100 text-sky-900">
      Partially Reviewed
    </Badge>
  );
}

export function ScheduledBadge({ date }: { date?: string }) {
  return (
    <Badge className="rounded-lg font-normal border-transparent bg-teal-100 text-teal-900">
      {date ? `Scheduled ${date}` : "Scheduled"}
    </Badge>
  );
}

// ── Donation Card Approvals Label ─────────────────────────────────────────────

interface ApprovalsLabelProps {
  approved: number;
  total: number;
  minApproved?: number;
}

export function ApprovalsLabel({
  approved,
  total,
  minApproved = 1,
}: ApprovalsLabelProps) {
  const meetsThreshold = approved >= minApproved;
  return (
    <Badge
      className={
        meetsThreshold
          ? "rounded-lg font-normal border-lime-600 bg-lime-50 text-lime-900"
          : "rounded-lg font-normal border-red-600 bg-red-50 text-red-900"
      }
    >
      {approved}/{total} Approved
    </Badge>
  );
}

// ── Item Status Labels ────────────────────────────────────────────────────────

export function ApprovedBadge() {
  return (
    <Badge className="rounded-lg font-normal border-lime-600 bg-lime-50 text-lime-900">
      Approved
    </Badge>
  );
}

export function RejectedBadge() {
  return (
    <Badge className="rounded-lg font-normal border-red-600 bg-red-50 text-red-900">
      Rejected
    </Badge>
  );
}

// ── Donation Pickup Status Labels ─────────────────────────────────────────────

export function UnconfirmedBadge() {
  return (
    <Badge className="rounded-lg font-normal border-transparent bg-red-100 text-red-900">
      Unconfirmed
    </Badge>
  );
}

export function ConfirmedBadge() {
  return (
    <Badge className="rounded-lg font-normal border-transparent bg-blue-100 text-blue-900">
      Confirmed
    </Badge>
  );
}

export function PickedUpBadge() {
  return (
    <Badge className="rounded-[8px] font-normal border-transparent bg-purple-100 text-purple-900">
      Picked up
    </Badge>
  );
}

export function DonationStatusBadge({
  status,
}: {
  status: DonationHistoryStatus;
}) {
  switch (status) {
    case "confirmed":
      return <ConfirmedBadge />;
    case "rejected":
      return <RejectedBadge />;
    case "approved":
      return <ApprovedBadge />;
    case "picked_up":
      return <PickedUpBadge />;
    case "unconfirmed":
    default:
      return <UnconfirmedBadge />;
  }
}

export type DonationHistoryStatus =
  | "unconfirmed"
  | "confirmed"
  | "approved"
  | "picked_up"
  | "rejected";