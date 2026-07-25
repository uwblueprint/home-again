import type { DonationRequest, ReviewStatus } from "./types";

/** Item statuses that count as "an admin has finished reviewing this item". */
const REVIEWED_ITEM_STATUSES = new Set(["APPROVED", "REJECTED"]);

/**
 * Derive how far along the admin's review is. Mirrors the backend's
 * services.donations.compute_review_status so the badge stays consistent:
 * a scheduled pickup wins, otherwise it's driven by item review progress.
 */
export function deriveReviewStatus(request: DonationRequest): ReviewStatus {
  if (request.pickup?.scheduled_date) {
    return "scheduled";
  }

  const items = request.items;
  const reviewed = items.filter((item) =>
    REVIEWED_ITEM_STATUSES.has(item.status)
  );

  if (items.length === 0 || reviewed.length === 0) {
    return "pending_review";
  }
  if (reviewed.length < items.length) {
    return "partially_reviewed";
  }
  return "reviewed";
}

/** Count of approved items — drives the "n/m Approved" header label. */
export function countApproved(request: DonationRequest): number {
  return request.items.filter((item) => item.status === "APPROVED").length;
}
