import type { DonationRequest } from "./types";

/**
 * Five placeholder photos for an item — the same furniture shot repeated, as in
 * the review frames, so the strip reads as one item's photo set.
 */
function samplePhotos() {
  return Array.from({ length: 5 }, (_, i) => ({
    url: "/sample-furniture.jpg",
    position: i,
  }));
}

/**
 * Seed data for the donation-request review screen. Stands in for
 * GET /donations/{id}/detail until the database is provisioned. Shaped to match
 * the "Katie Sun / 2 items" request in the Figma flow.
 */
export const DONATION_REQUEST_FIXTURE: DonationRequest = {
  id: "donation-req-001",
  request_id: "REQUEST ID",
  submitted_at: "2026-03-14",
  donor: {
    first_name: "Katie",
    last_name: "Sun",
    email: "katiesun@uwblueprint.org",
    phone: "(+1) 647-909-9581",
    smoking_household: false,
    has_pets: false,
    pickup_address: "210 Drake Ave, NL, CA A2V 1K5",
  },
  furniture_items: [
    {
      id: "item-dining",
      name: "Dining table & chairs / set",
      condition: "No Stains",
      status: "PICKUP_PENDING",
      rejection_reason: null,
      rejection_details: null,
      photos: samplePhotos(),
    },
    {
      id: "item-sofa",
      name: "Sofa",
      condition: "No Stains",
      status: "PICKUP_PENDING",
      rejection_reason: null,
      rejection_details: null,
      photos: samplePhotos(),
    },
  ],
  pickup: null,
};
