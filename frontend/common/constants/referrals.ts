export const REFERRAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  COMPLETED: "completed",
  DECLINED: "declined",
} as const;

export type ReferralStatus =
  (typeof REFERRAL_STATUS)[keyof typeof REFERRAL_STATUS];

export const REFERRAL_REVIEW_STATUS = {
  PENDING_REVIEW: "pending_review",
  PARTIALLY_REVIEWED: "partially_reviewed",
  APPROVED: "approved",
  PARTIALLY_APPROVED: "partially_approved",
  REJECTED: "rejected",
  SCHEDULED: "scheduled",
  DELIVERED: "delivered",
} as const;

export type ReferralReviewStatus =
  (typeof REFERRAL_REVIEW_STATUS)[keyof typeof REFERRAL_REVIEW_STATUS];

export const REFERRAL_ITEM_STATUS = {
  PENDING_REVIEW: "PENDING_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SCHEDULED: "SCHEDULED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type ReferralItemStatus =
  (typeof REFERRAL_ITEM_STATUS)[keyof typeof REFERRAL_ITEM_STATUS];

export const REFERRAL_REJECTION_REASON = {
  DUPLICATE: "duplicate",
  LOCATION: "location",
  INCOMPLETE: "incomplete",
  OTHER: "other",
} as const;

export type ReferralRejectionReason =
  (typeof REFERRAL_REJECTION_REASON)[keyof typeof REFERRAL_REJECTION_REASON];

export const REFERRAL_REJECTION_REASON_LABELS: Record<
  ReferralRejectionReason,
  string
> = {
  [REFERRAL_REJECTION_REASON.DUPLICATE]:
    "Submitted a referral this year already",
  [REFERRAL_REJECTION_REASON.LOCATION]: "Location outside service area",
  [REFERRAL_REJECTION_REASON.INCOMPLETE]: "Incomplete information",
  [REFERRAL_REJECTION_REASON.OTHER]: "Other",
};
