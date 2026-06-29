import { Badge } from "@/common/components/ui/badge";

// ── Donation Status Labels ────────────────────────────────────────────────────
export function ReviewedBadge() {
  return (
    <Badge className="rounded-full border-transparent bg-lime-100 text-lime-900">
      Reviewed
    </Badge>
  );
}

export function PendingReviewBadge() {
  return (
    <Badge className="rounded-full border-transparent bg-amber-100 text-amber-900">
      Pending Review
    </Badge>
  );
}

export function PartiallyReviewedBadge() {
  return (
    <Badge className="rounded-full border-transparent bg-sky-100 text-sky-900">
      Partially Reviewed
    </Badge>
  );
}


// ── Donation Card Approvals Label ─────────────────────────────────────────────

interface ApprovalsLabelProps {
  approved: number;
  total: number;
}

export function ApprovalsLabel({ approved, total }: ApprovalsLabelProps) {
  const allApproved = approved === total;
  return (
    <Badge
      className={
        allApproved
          ? "rounded-full border-lime-600 bg-lime-50 text-lime-900"
          : "rounded-full border-red-600 bg-red-50 text-red-900"
      }
    >
      {approved}/{total} Approved
    </Badge>
  );
}

// ── Item Status Labels ────────────────────────────────────────────────────────

export function ApprovedBadge() {
  return (
    <Badge className="rounded-full border-lime-600 bg-lime-50 text-lime-900">
      Approved
    </Badge>
  );
}

export function RejectedBadge() {
  return (
    <Badge className="rounded-full border-red-600 bg-red-50 text-red-900">
      Rejected
    </Badge>
  );
}

// ── Donation Pickup Status Labels ─────────────────────────────────────────────

export function UnconfirmedBadge() {
  return (
    <Badge className="rounded-full border-transparent bg-red-100 text-red-900">
      Unconfirmed
    </Badge>
  );
}

export function ConfirmedBadge() {
  return (
    <Badge className="rounded-full border-transparent bg-blue-100 text-blue-900">
      Confirmed
    </Badge>
  );
}