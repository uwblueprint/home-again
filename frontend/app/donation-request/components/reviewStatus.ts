import type { DonationReviewStatus } from "@/common/types";
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

/**
 * An item counts as approved once reviewed and not rejected — including the
 * downstream states (OFFERED, SCHEDULED, …), which only follow an approval.
 */
export const isApproved = (status: string) =>
  isReviewed(status) && status !== "REJECTED";

/** Count of approved items — drives the "n/m Approved" labels. */
export function countApproved(request: DonationRequest): number {
  return request.furniture_items.filter((item) => isApproved(item.status))
    .length;
}

/**
 * The backend's full `DonationReviewStatus` for a request, mirroring
 * services.donations.compute_review_status. The detail page shows the
 * server's review_status, and uses this only once local review edits have made
 * it stale. `pickedUp` stands in for the donation's COMPLETED status, which
 * the view model doesn't carry.
 */
export function deriveDonationReviewStatus(
  request: DonationRequest,
  pickedUp = false
): DonationReviewStatus {
  // Picked up is final, whatever the items say.
  if (pickedUp) return "picked_up";

  const items = request.furniture_items;
  const reviewed = items.filter((item) => isReviewed(item.status));

  if (items.length === 0 || reviewed.length === 0) return "pending_review";
  if (reviewed.length < items.length) return "partially_reviewed";

  const approved = countApproved(request);
  if (approved === 0) return "rejected";

  // As in deriveReviewStatus, scheduling only outranks a finished review.
  if (request.pickup?.scheduled_date) {
    return request.pickup.confirmed_at ? "confirmed" : "scheduled";
  }
  return approved === items.length ? "approved" : "partially_approved";
}
