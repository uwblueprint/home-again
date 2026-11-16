import { countApproved, deriveReviewStatus } from "./reviewStatus";
import type {
  DonationRequest,
  DonationRequestOutcome,
  DonationRequestRow,
} from "./types";

/**
 * "2 Bed Frame, 2 Mattress": item names in first-seen order, each with how
 * many times it appears.
 */
export function summarizeItems(request: DonationRequest): string {
  const counts = new Map<string, number>();
  for (const item of request.furniture_items) {
    counts.set(item.name, (counts.get(item.name) ?? 0) + 1);
  }
  return Array.from(counts, ([name, count]) => `${count} ${name}`).join(", ");
}

/**
 * Which Filter menu options a request matches. Items past review count as
 * approved unless REJECTED (OFFERED, SCHEDULED, … all follow an approval).
 * "Partially approved" means a mix of approved and rejected items.
 */
export function deriveOutcomes(
  request: DonationRequest
): DonationRequestOutcome[] {
  const items = request.furniture_items;
  const rejected = items.filter((item) => item.status === "REJECTED").length;
  const approved = items.filter(
    (item) => item.status !== "PICKUP_PENDING" && item.status !== "REJECTED"
  ).length;

  const outcomes: DonationRequestOutcome[] = [];
  if (items.length > 0 && approved === items.length) {
    outcomes.push("fully_approved");
  }
  if (items.length > 0 && rejected === items.length) {
    outcomes.push("fully_rejected");
  }
  if (approved > 0 && rejected > 0) outcomes.push("partially_approved");
  outcomes.push(request.pickup?.scheduled_date ? "scheduled" : "unscheduled");
  return outcomes;
}

/** Flattens a donation request into one row of the donation-requests list. */
export function toDonationRequestRow(
  request: DonationRequest
): DonationRequestRow {
  return {
    id: request.id,
    donorName: `${request.donor.first_name} ${request.donor.last_name}`,
    requestId: request.request_id,
    submittedAt: request.submitted_at,
    items: summarizeItems(request),
    status: deriveReviewStatus(request),
    approvedCount: countApproved(request),
    itemCount: request.furniture_items.length,
    scheduledDate: request.pickup?.scheduled_date ?? null,
    outcomes: deriveOutcomes(request),
  };
}
