import type { DonationHistoryStatus } from "@/common/components/status-labels";
import type { DonationDetail } from "@/common/types";
import type { DonationHistoryRow } from "./HistoryTableColumns";

/**
 * The badge a donor's donation shows in their history, from most to least
 * final: picked up, then fully rejected, then how far review has got.
 */
function historyStatus(donation: DonationDetail): DonationHistoryStatus {
  if (donation.status === "completed") return "picked_up";

  const items = donation.furniture_items;
  if (items.length > 0 && items.every((item) => item.status === "REJECTED")) {
    return "rejected";
  }

  switch (donation.review_status) {
    case "scheduled":
      return donation.pickup?.confirmed_at ? "confirmed" : "scheduled_by";
    case "reviewed":
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
    approvedCount: donation.furniture_items.filter(
      (item) => item.status === "APPROVED"
    ).length,
    scheduledDate: donation.pickup?.scheduled_date ?? undefined,
  };
}
