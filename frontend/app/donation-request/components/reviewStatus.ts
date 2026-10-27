import type { DonationRequest, ReviewStatus } from "./types";

/**
 * An item counts as reviewed once it has left PICKUP_PENDING — including the
 * downstream states (OFFERED, SCHEDULED, …), so a finished review never slides
 * back to "pending". Mirrors services.donations.REVIEWED_FURNITURE_STATUSES.
 */
const isReviewed = (status: string) => status !== "PICKUP_PENDING";

/**
 * Derive how far along the admin's review is. Mirrors the backend's
 * services.donations.compute_review_status, including its ordering: scheduling
 * only outranks a *finished* review, so a pickup booked while items are still
 * outstanding must not hide that they need attention.
 */
export function deriveReviewStatus(request: DonationRequest): ReviewStatus {
  const items = request.furniture_items;
  const reviewed = items.filter((item) => isReviewed(item.status));

  // A donation with no items yet has nothing to review.
  if (items.length === 0 || reviewed.length === 0) {
    return "pending_review";
  }
  if (reviewed.length < items.length) {
    return "partially_reviewed";
  }
  if (request.pickup?.scheduled_date) {
    return "scheduled";
  }
  return "reviewed";
}

/** Count of approved items — drives the "n/m Approved" header label. */
export function countApproved(request: DonationRequest): number {
  return request.furniture_items.filter((item) => item.status === "APPROVED")
    .length;
}
