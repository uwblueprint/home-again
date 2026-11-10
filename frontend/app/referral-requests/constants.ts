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

/**
 * docs/SCHEMA.md lists ReferralStatus as pending | approved | completed | declined.
 * Update these two values once the backend enum supports waitlist / reject.
 */
export const API_STATUS: Record<MoveTarget, string> = {
  waitlisted: "waitlisted",
  rejected: "rejected",
};
