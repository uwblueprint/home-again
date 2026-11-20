import {
  REFERRAL_STATUS,
  type ReferralStatus,
} from "@/common/constants/referrals";
import type {
  MoveTarget,
  ReferralTab,
  ReviewFilter,
  ReviewStatus,
} from "./types";

export const PAGE_SIZE = 5;

export const TABS: { key: ReferralTab; label: string }[] = [
  { key: "new", label: "New" },
  { key: "waitlisted", label: "Waitlisted" },
  { key: "rejected", label: "Rejected" },
];

export const CLIENT_REFERRAL_TAB: Record<
  "NEW" | "WAITLISTED" | "REJECTED",
  ReferralTab
> = {
  NEW: "new",
  WAITLISTED: "waitlisted",
  REJECTED: "rejected",
};

export const REVIEW_FILTERS: { key: ReviewFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending-review", label: "Pending Review" },
  { key: "partially-reviewed", label: "Partially Reviewed" },
  { key: "reviewed", label: "Reviewed" },
];

export const CLIENT_REFERRAL_REVIEW_STATUS: Record<
  "PENDING" | "PARTIALLY_REVIEWED" | "REVIEWED",
  ReviewStatus
> = {
  PENDING: "pending-review",
  PARTIALLY_REVIEWED: "partially-reviewed",
  REVIEWED: "reviewed",
};

export const CLIENT_REFERRAL_REQUEST_STATUS = {
  REJECTED: "rejected",
  PENDING_REVIEW: CLIENT_REFERRAL_REVIEW_STATUS.PENDING,
  PARTIALLY_REVIEWED: CLIENT_REFERRAL_REVIEW_STATUS.PARTIALLY_REVIEWED,
  REVIEWED: CLIENT_REFERRAL_REVIEW_STATUS.REVIEWED,
} as const;

/** The current backend models waitlisted as approved and rejected as declined. */
export const API_STATUS: Record<MoveTarget, ReferralStatus> = {
  waitlisted: REFERRAL_STATUS.APPROVED,
  rejected: REFERRAL_STATUS.DECLINED,
};
