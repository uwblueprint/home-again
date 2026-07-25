/**
 * View-model types for the donation-request review screen.
 *
 * These mirror the backend schemas added for the review flow
 * (see backend/app/schemas.py: DonationDetail, FurnitureDetail, Pickup) using
 * the same field names, so wiring to the live API later is a fetch swap rather
 * than a reshape. The page currently reads them from a local store — no API.
 */

export type ItemReviewStatus =
  | "PICKUP_PENDING" // awaiting review
  | "APPROVED"
  | "REJECTED";

export type ReviewStatus =
  | "pending_review"
  | "partially_reviewed"
  | "reviewed"
  | "scheduled";

/** Mirrors backend FurnitureRejectionReason. */
export type RejectionReason = "condition" | "pickup" | "location" | "other";

export interface DonationPhoto {
  url: string;
  position: number;
}

export interface DonationRequestItem {
  id: string;
  name: string;
  /** e.g. "No Stains" — shown under the item name. */
  condition: string;
  status: ItemReviewStatus;
  rejection_reason: RejectionReason | null;
  rejection_details: string | null;
  photos: DonationPhoto[];
}

export interface DonorInformation {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  smoking_household: boolean | null;
  has_pets: boolean | null;
  /** Free-form single-line pickup address for display. */
  pickup_address: string;
}

export interface DonationPickup {
  id: string;
  /** ISO date (yyyy-mm-dd) the pickup is scheduled for. */
  scheduled_date: string | null;
  note: string | null;
  /** ISO timestamp when the donor confirmation was sent, or null. */
  confirmed_at: string | null;
}

export interface DonationRequest {
  id: string;
  /** Human-facing request id shown in the subheading. */
  request_id: string;
  /** ISO date the request was submitted. */
  submitted_at: string;
  donor: DonorInformation;
  items: DonationRequestItem[];
  pickup: DonationPickup | null;
}
