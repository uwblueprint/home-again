import type { DonationDetail } from "@/common/types";
import type { DonationRequestOutcome, DonationRequestRow } from "./types";

/**
 * "2 Bed Frame, 2 Mattress": item names in first-seen order, each with how
 * many times it appears.
 */
export function summarizeItems(names: string[]): string {
  const counts = new Map<string, number>();
  for (const name of names) {
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return Array.from(counts, ([name, count]) => `${count} ${name}`).join(", ");
}

/**
 * Which Filter menu options a request matches. Items past review count as
 * approved unless REJECTED (OFFERED, SCHEDULED, … all follow an approval), like
 * the backend's approved_count. "Partially approved" means a mix of approved
 * and rejected items.
 */
export function deriveOutcomes(
  donation: DonationDetail
): DonationRequestOutcome[] {
  const items = donation.furniture_items;
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
  outcomes.push(donation.pickup?.scheduled_date ? "scheduled" : "unscheduled");
  return outcomes;
}

/** A calendar date the backend stores at midnight (e.g. a pickup date). */
function toDateOnly(value: string | null | undefined): string | null {
  return value ? value.slice(0, 10) : null;
}

/**
 * A moment the backend stores as naive UTC (e.g. created_at), as the local
 * yyyy-mm-dd date, so an evening submission isn't shown as the next day.
 */
function toLocalDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(
    /[zZ]|[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`
  );
  if (Number.isNaN(date.getTime())) return toDateOnly(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Flattens a donation from GET /donations/details into one list row. */
export function toDonationRequestRow(
  donation: DonationDetail
): DonationRequestRow {
  const { donor } = donation;
  return {
    id: donation.id,
    donorName:
      [donor?.first_name, donor?.last_name].filter(Boolean).join(" ") || "—",
    // There's no human-facing request number yet; show the id's first block.
    requestId: donation.id.split("-")[0].toUpperCase(),
    submittedAt: toLocalDate(donation.created_at) ?? "",
    items: summarizeItems(donation.furniture_items.map((item) => item.name)),
    status: donation.review_status,
    approvedCount: donation.approved_count,
    itemCount: donation.item_count,
    scheduledDate: toDateOnly(donation.pickup?.scheduled_date),
    outcomes: deriveOutcomes(donation),
  };
}
