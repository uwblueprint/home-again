import type {
  DonationDetail,
  DonationItemDetail,
  FurnitureStatus,
} from "@/common/types";
import { donors } from "./donors";

/** Five placeholder photos, as in the review frames. */
function photos(itemId: string) {
  return Array.from({ length: 5 }, (_, position) => ({
    id: `${itemId}-photo-${position}`,
    furniture_id: itemId,
    url: "/sample-furniture.jpg",
    position,
    created_at: "2026-03-14T15:00:00",
    updated_at: "2026-03-14T15:00:00",
  }));
}

function item(
  id: string,
  donationId: string,
  name: string,
  status: FurnitureStatus,
  overrides: Partial<DonationItemDetail> = {}
): DonationItemDetail {
  return {
    id,
    name,
    image_url: "/sample-furniture.jpg",
    description: "No Stains",
    condition: "good",
    colour: "brown",
    category: "living room",
    smoking_household: false,
    has_pets: false,
    status,
    rejection_reason: null,
    rejection_details: null,
    donation_id: donationId,
    reviewed_at: status === "PICKUP_PENDING" ? null : "2026-03-15T15:00:00",
    photos: photos(id),
    created_at: "2026-03-14T15:00:00",
    updated_at: "2026-03-14T15:00:00",
    ...overrides,
  };
}

function donorFor(id: string) {
  return donors.find((donor) => donor.id === id) ?? null;
}

/**
 * `GET /donations/{id}/detail` and `GET /donors/{id}/donations` responses.
 * Ids and donors line up with the `donations` fixture, so the donor list's
 * donation counts match each donor's history.
 */
export const donationDetails: DonationDetail[] = [
  {
    id: "donation-001",
    donor_id: "donor-001",
    donation_type: "person",
    charitable_receipt_estimate: null,
    address_line_1: "45 Maple Drive",
    address_line_2: null,
    city: "Ottawa",
    postal_code: "K1A 2B3",
    status: "pending",
    smoking_household: false,
    has_pets: false,
    created_at: "2026-03-14T15:00:00",
    updated_at: "2026-03-14T15:00:00",
    review_status: "pending_review",
    donor: donorFor("donor-001"),
    furniture_items: [
      item("item-001-a", "donation-001", "Queen Bed Frame", "PICKUP_PENDING"),
      item("item-001-b", "donation-001", "Dresser", "PICKUP_PENDING"),
    ],
    pickup: null,
  },
  {
    id: "donation-002",
    donor_id: "donor-002",
    donation_type: "person",
    charitable_receipt_estimate: null,
    address_line_1: "12 Elm Street",
    address_line_2: "Unit 4",
    city: "Ottawa",
    postal_code: "K2P 1L4",
    status: "pending",
    smoking_household: false,
    has_pets: true,
    created_at: "2026-02-20T15:00:00",
    updated_at: "2026-02-22T15:00:00",
    review_status: "scheduled",
    donor: donorFor("donor-002"),
    furniture_items: [
      item(
        "item-002-a",
        "donation-002",
        "Dining table & chairs / set",
        "APPROVED"
      ),
      item("item-002-b", "donation-002", "Sofa", "REJECTED", {
        rejection_reason: "condition",
        rejection_details: "Visible stains on cushions",
      }),
    ],
    pickup: {
      id: "pickup-002",
      route_id: null,
      donation_id: "donation-002",
      scheduled_date: "2026-03-26T00:00:00",
      note: "Donor prefers afternoon pickup",
      confirmed_at: null,
      created_at: "2026-02-22T15:00:00",
      updated_at: "2026-02-22T15:00:00",
    },
  },
  {
    id: "donation-003",
    donor_id: "donor-003",
    donation_type: "person",
    charitable_receipt_estimate: null,
    address_line_1: "8 Birch Crescent",
    address_line_2: null,
    city: "Ottawa",
    postal_code: "K1S 3G7",
    status: "completed",
    smoking_household: false,
    has_pets: false,
    created_at: "2026-01-05T15:00:00",
    updated_at: "2026-01-20T15:00:00",
    review_status: "reviewed",
    donor: donorFor("donor-003"),
    furniture_items: [
      item("item-003-a", "donation-003", "Bookshelf", "DELIVERED"),
    ],
    pickup: null,
  },
];
