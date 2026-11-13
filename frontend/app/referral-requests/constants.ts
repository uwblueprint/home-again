import type { MoveTarget, ReferralTab, ReviewFilter } from "./types";

export const PAGE_SIZE = 5;

export const TABS: { key: ReferralTab; label: string }[] = [
  { key: "new", label: "New" },
  { key: "waitlisted", label: "Waitlisted" },
  { key: "rejected", label: "Rejected" },
];

export const REVIEW_FILTERS: { key: ReviewFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending-review", label: "Pending Review" },
  { key: "partially-reviewed", label: "Partially Reviewed" },
  { key: "reviewed", label: "Reviewed" },
];

/** The current backend models waitlisted as approved and rejected as declined. */
export const API_STATUS: Record<
  MoveTarget,
  "approved" | "declined"
> = {
  waitlisted: "approved",
  rejected: "declined",
};
