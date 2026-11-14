"use client";

import type { ColumnDef, FilterFn } from "@tanstack/react-table";

import {
  ApprovalsLabel,
  PartiallyReviewedBadge,
  PendingReviewBadge,
  ScheduledBadge,
} from "@/common/components/status-labels";
import { formatDayMonthYear, formatShortDate } from "@/common/utils/DateUtils";
import type {
  DonationRequestOutcome,
  DonationRequestRow,
  ReviewStatus,
} from "./types";

/** Labels for the list's Filter menu, in menu order. */
export const OUTCOME_FILTER_OPTIONS: {
  value: DonationRequestOutcome;
  label: string;
}[] = [
  { value: "fully_approved", label: "Fully approved" },
  { value: "fully_rejected", label: "Fully rejected" },
  { value: "partially_approved", label: "Partially approved" },
  { value: "scheduled", label: "Scheduled" },
  { value: "unscheduled", label: "Unscheduled" },
];

export function ReviewStatusBadge({
  status,
  scheduledDate,
  approvedCount = 0,
  itemCount = 0,
}: {
  status: ReviewStatus;
  scheduledDate?: string | null;
  /** Shown as "n/m Approved" once review is finished. */
  approvedCount?: number;
  itemCount?: number;
}) {
  switch (status) {
    case "pending_review":
      return <PendingReviewBadge />;
    case "partially_reviewed":
      return <PartiallyReviewedBadge />;
    case "reviewed":
      // The design shows how many items passed review, not a plain "Reviewed".
      return <ApprovalsLabel approved={approvedCount} total={itemCount} />;
    case "scheduled":
      return (
        <ScheduledBadge
          date={scheduledDate ? formatShortDate(scheduledDate) : undefined}
        />
      );
  }
}

/** Keeps rows matching any selected Filter option. */
const matchesAnyOutcome: FilterFn<DonationRequestRow> = (
  row,
  columnId,
  filterValue: string[]
) => {
  const outcomes = row.getValue<DonationRequestOutcome[]>(columnId);
  return filterValue.some((value) =>
    outcomes.includes(value as DonationRequestOutcome)
  );
};

export const donationRequestColumns: ColumnDef<DonationRequestRow>[] = [
  { accessorKey: "donorName", header: "Donor Name" },
  { accessorKey: "requestId", header: "Request ID" },
  {
    id: "dateSubmitted",
    // Display string so search matches what users see; sort on the ISO date.
    accessorFn: (row) => formatDayMonthYear(row.submittedAt),
    sortingFn: (a, b) =>
      a.original.submittedAt.localeCompare(b.original.submittedAt),
    header: "Date Submitted",
  },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ row }) => (
      <span className="block max-w-56 truncate" title={row.original.items}>
        {row.original.items}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    // Badge text isn't the raw status, so keep it out of search.
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <ReviewStatusBadge
        status={row.original.status}
        scheduledDate={row.original.scheduledDate}
        approvedCount={row.original.approvedCount}
        itemCount={row.original.itemCount}
      />
    ),
  },
  // Hidden; backs the Filter menu.
  {
    accessorKey: "outcomes",
    header: "Outcome",
    filterFn: matchesAnyOutcome,
    enableGlobalFilter: false,
    enableSorting: false,
  },
];

export const donationRequestHiddenColumns = { outcomes: false };
