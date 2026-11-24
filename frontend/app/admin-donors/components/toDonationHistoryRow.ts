import { isApproved } from "@/app/donation-request/components";
import type { DonationHistoryStatus } from "@/common/components/status-labels";
import type { DonationDetail } from "@/common/types";
import type { DonationHistoryRow } from "./HistoryTableColumns";

/**
 * The badge a donor's donation shows in their history, from most to least
 * final: picked up or cancelled, then the backend's review status.
 */
function historyStatus(donation: DonationDetail): DonationHistoryStatus {
  if (donation.status === "completed") return "picked_up";
  // Cancelling an approved donation lands with the pickup/dropoff flow; the
  // badge is here so the history already shows it.
  if (donation.status === "cancelled") return "cancelled";

  switch (donation.review_status) {
    case "picked_up":
      return "picked_up";
    case "rejected":
      return "rejected";
    case "confirmed":
      return "confirmed";
    case "scheduled":
      return "scheduled_by";
    case "approved":
    case "partially_approved":
      return "approved_fraction";
    case "partially_reviewed":
      return "partially_reviewed";
    case "pending_review":
      return "pending_review";
  }
}

export function toDonationHistoryRow(
  donation: DonationDetail
): DonationHistoryRow {
  return {
    donationDate: donation.created_at,
    donationId: donation.id,
    items: donation.furniture_items.map((item) => item.name),
    status: historyStatus(donation),
    // Shared with the donation requests list: items past approval (OFFERED,
    // SCHEDULED, …) still count as approved.
    approvedCount: donation.furniture_items.filter((item) =>
      isApproved(item.status)
    ).length,
    scheduledDate: donation.pickup?.scheduled_date ?? undefined,
  };
}
