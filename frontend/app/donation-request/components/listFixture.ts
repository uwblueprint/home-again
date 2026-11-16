import { DONATION_REQUEST_FIXTURE } from "./fixture";
import { toDonationRequestRow } from "./listRow";
import type {
  DonationRequest,
  DonationRequestItem,
  DonationRequestRow,
  ItemReviewStatus,
} from "./types";

const DONORS: [string, string][] = [
  ["Jane", "Doe"],
  ["Marcus", "Chen"],
  ["Priya", "Patel"],
  ["Liam", "O'Connor"],
  ["Sofia", "Rossi"],
  ["Ahmed", "Hassan"],
  ["Grace", "Kim"],
  ["Noah", "Tremblay"],
];

const ITEM_SETS: string[][] = [
  ["Bed Frame", "Bed Frame", "Mattress", "Mattress"],
  ["Sofa", "Coffee Table"],
  ["Dining Table", "Chair", "Chair", "Chair", "Chair"],
  ["Dresser"],
  ["Nightstand", "Nightstand", "Bookshelf"],
];

/** How far along each sample request's review is. */
type SampleStage = "pending" | "partial" | "reviewed" | "scheduled";

/**
 * Matches the tab counts in the Figma frame: All (65) = Pending (12) +
 * Partially Reviewed (3) + Reviewed (50). Scheduled requests have finished
 * review, so they count under Reviewed.
 */
const STAGE_COUNTS: [SampleStage, number][] = [
  ["pending", 12],
  ["partial", 3],
  ["reviewed", 40],
  ["scheduled", 10],
];

const TOTAL_REQUESTS = STAGE_COUNTS.reduce((sum, [, count]) => sum + count, 0);

const DAY_MS = 24 * 60 * 60 * 1000;
const NEWEST_SUBMISSION = Date.UTC(2026, 2, 23);

function isoDaysBefore(base: number, days: number) {
  return new Date(base - days * DAY_MS).toISOString().slice(0, 10);
}

/** Item statuses for a stage; `variant` spreads reviewed outcomes around. */
function itemStatuses(
  stage: SampleStage,
  count: number,
  variant: number
): ItemReviewStatus[] {
  if (stage === "pending") return Array(count).fill("PICKUP_PENDING");
  if (stage === "partial") {
    return ["APPROVED", ...Array(count - 1).fill("PICKUP_PENDING")];
  }
  switch (variant % 4) {
    case 2: // mix: first rejected, rest approved
      return ["REJECTED", ...Array(count - 1).fill("APPROVED")];
    case 3:
      return Array(count).fill("REJECTED");
    default:
      return Array(count).fill("APPROVED");
  }
}

function makeRequest(
  stage: SampleStage,
  index: number,
  variant: number
): DonationRequest {
  const [firstName, lastName] = DONORS[index % DONORS.length];
  // Partially reviewed needs at least two items (one reviewed, one not).
  const names =
    stage === "partial" ? ITEM_SETS[0] : ITEM_SETS[index % ITEM_SETS.length];
  const statuses = itemStatuses(stage, names.length, variant);
  // Spread submission dates across stages so date sorts mix statuses.
  const daysAgo = (index * 7) % TOTAL_REQUESTS;
  const submittedAt = isoDaysBefore(NEWEST_SUBMISSION, daysAgo);
  const id = `donation-req-${String(index + 1).padStart(3, "0")}`;

  const furnitureItems: DonationRequestItem[] = names.map((name, i) => ({
    id: `${id}-item-${i}`,
    name,
    condition: "No Stains",
    status: statuses[i],
    rejection_reason: statuses[i] === "REJECTED" ? "condition" : null,
    rejection_details: null,
    photos: [],
  }));

  return {
    id,
    request_id: `DR-2026-${String(100 + index).padStart(4, "0")}`,
    submitted_at: submittedAt,
    donor: {
      first_name: firstName,
      last_name: lastName,
      email: `${firstName.toLowerCase()}@example.com`,
      phone: "(+1) 647 123 4567",
      smoking_household: false,
      has_pets: false,
      pickup_address: "210 Drake Ave, NL, CA A2V 1K5",
    },
    furniture_items: furnitureItems,
    pickup:
      stage === "scheduled"
        ? {
            id: `${id}-pickup`,
            scheduled_date: isoDaysBefore(NEWEST_SUBMISSION, daysAgo - 30),
            note: null,
            confirmed_at: null,
          }
        : null,
  };
}

/**
 * Seed requests for the donation-requests list. Stands in for GET /donations
 * until the database is provisioned. The first is the review-screen fixture,
 * so its row opens a working detail page; the rest are list-only placeholders
 * (the detail page only knows the fixture, so they 404).
 */
function makeRequests(): DonationRequest[] {
  const stages = STAGE_COUNTS.flatMap(([stage, count]) =>
    Array.from({ length: count }, (_, variant) => ({ stage, variant }))
  );
  return stages.map(({ stage, variant }, index) =>
    index === 0 ? DONATION_REQUEST_FIXTURE : makeRequest(stage, index, variant)
  );
}

export const DONATION_REQUEST_ROWS: DonationRequestRow[] =
  makeRequests().map(toDonationRequestRow);
