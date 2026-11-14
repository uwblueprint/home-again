import type {
  DonationDetail,
  DonationItemDetail,
  DonationReviewStatus,
  FurnitureStatus,
} from "@/common/types";

/**
 * Sample GET /donations/details response for the donation-requests list, in
 * the backend's shape. Each request's review_status and counts follow the
 * backend's rules (services.donations.compute_review_status).
 */

const DONORS: [string, string][] = [
  ["Katie", "Sun"],
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

/** How far along each sample request is. */
type SampleStage = "pending" | "partial" | "reviewed" | "scheduled";

/**
 * Matches the tab counts in the Figma frame: All (65) = Pending (12) +
 * Partially Reviewed (3) + Reviewed (50). Requests that are scheduled,
 * confirmed or picked up have finished review, so they count under Reviewed.
 */
const STAGE_COUNTS: [SampleStage, number][] = [
  ["pending", 12],
  ["partial", 3],
  ["reviewed", 40],
  ["scheduled", 10],
];

const DAY_MS = 24 * 60 * 60 * 1000;
const NEWEST_SUBMISSION = Date.UTC(2026, 2, 23);
const TOTAL = STAGE_COUNTS.reduce((sum, [, count]) => sum + count, 0);

function isoDaysBefore(days: number) {
  return new Date(NEWEST_SUBMISSION - days * DAY_MS).toISOString().slice(0, 19);
}

/** Item statuses for a stage; `variant` spreads reviewed outcomes around. */
function itemStatuses(
  stage: SampleStage,
  count: number,
  variant: number
): FurnitureStatus[] {
  if (stage === "pending") return Array(count).fill("PICKUP_PENDING");
  if (stage === "partial") {
    return ["APPROVED", ...Array(count - 1).fill("PICKUP_PENDING")];
  }
  if (stage === "scheduled") return Array(count).fill("APPROVED");
  switch (variant % 4) {
    case 1: // mix: first rejected, rest approved
      return ["REJECTED", ...Array(count - 1).fill("APPROVED")];
    case 2:
      return Array(count).fill("REJECTED");
    default:
      return Array(count).fill("APPROVED");
  }
}

function reviewStatus(
  stage: SampleStage,
  variant: number,
  approved: number,
  total: number
): DonationReviewStatus {
  if (stage === "pending") return "pending_review";
  if (stage === "partial") return "partially_reviewed";
  if (stage === "scheduled") return variant % 2 ? "confirmed" : "scheduled";
  if (approved === 0) return "rejected";
  if (variant % 4 === 3) return "picked_up";
  return approved === total ? "approved" : "partially_approved";
}

function makeDonation(
  stage: SampleStage,
  index: number,
  variant: number
): DonationDetail {
  // UUID-shaped like real ids, with a distinct first block per request.
  const id = `${(0x3f2a9c00 + index * 7919).toString(16)}-0000-4000-8000-${String(
    index + 1
  ).padStart(12, "0")}`;
  const [firstName, lastName] = DONORS[index % DONORS.length];
  // Partially reviewed needs at least two items (one reviewed, one not).
  const names =
    stage === "partial" ? ITEM_SETS[0] : ITEM_SETS[index % ITEM_SETS.length];
  const statuses = itemStatuses(stage, names.length, variant);
  const approved = statuses.filter(
    (status) => status !== "PICKUP_PENDING" && status !== "REJECTED"
  ).length;
  const status = reviewStatus(stage, variant, approved, names.length);
  // Spread submission dates across stages so date sorts mix statuses.
  const daysAgo = (index * 7) % TOTAL;
  const createdAt = isoDaysBefore(daysAgo);
  const hasPickup = ["scheduled", "confirmed", "picked_up"].includes(status);

  const items: DonationItemDetail[] = names.map((name, i) => ({
    id: `${id}-item-${i}`,
    name,
    image_url: "",
    description: "No stains",
    condition: null,
    colour: "",
    category: "Other",
    smoking_household: false,
    has_pets: false,
    status: statuses[i],
    rejection_reason: statuses[i] === "REJECTED" ? "condition" : null,
    rejection_details: null,
    donation_id: id,
    inventory_id: null,
    reviewed_at: statuses[i] === "PICKUP_PENDING" ? null : createdAt,
    photos: [],
    created_at: createdAt,
    updated_at: createdAt,
  }));

  return {
    id,
    donor_id: `donor-${index % DONORS.length}`,
    donation_type: null,
    charitable_receipt_estimate: null,
    address_line_1: "210 Drake Ave",
    address_line_2: null,
    city: "St. John's",
    postal_code: "A2V 1K5",
    status: status === "picked_up" ? "completed" : "pending",
    smoking_household: false,
    has_pets: false,
    created_at: createdAt,
    updated_at: createdAt,
    review_status: status,
    approved_count: approved,
    item_count: names.length,
    donor: {
      id: `donor-${index % DONORS.length}`,
      name: null,
      first_name: firstName,
      last_name: lastName,
      email: `${firstName.toLowerCase()}@example.com`,
      phone: "6471234567",
      address: null,
      city: null,
      postal_code: null,
      country: null,
      smoking_household: null,
      donation_type: null,
      is_anonymous: false,
      created_at: createdAt,
      updated_at: createdAt,
    },
    furniture_items: items,
    pickup: hasPickup
      ? {
          id: `${id}-pickup`,
          route_id: null,
          donation_id: id,
          scheduled_date: isoDaysBefore(daysAgo - 30),
          note: null,
          confirmed_at: status === "scheduled" ? null : createdAt,
          created_at: createdAt,
          updated_at: createdAt,
        }
      : null,
  };
}

export const donationRequests: DonationDetail[] = STAGE_COUNTS.flatMap(
  ([stage, count]) =>
    Array.from({ length: count }, (_, variant) => ({ stage, variant }))
).map(({ stage, variant }, index) => makeDonation(stage, index, variant));
