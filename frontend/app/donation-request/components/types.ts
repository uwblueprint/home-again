/**
 * View-model types for the donation-request review screen.
 *
 * These mirror the backend schemas added for the review flow
 * (see backend/app/schemas.py: DonationDetail, FurnitureDetail, Pickup) using
 * the same field names, so wiring to the live API later is a fetch swap rather
 * than a reshape. The page currently reads them from a local store — no API.
 *
 * Deliberate divergences from those schemas, so the next reader can tell intent
 * from oversight:
 *  - `DonorInformation` is a display shape, not backend `Donor`. It flattens the
 *    donation-level `smoking_household` / `has_pets` onto the donor, and carries
 *    `pickup_address` as one preformatted line where the backend stores
 *    `address_line_1` / `address_line_2` / `city` / `postal_code` separately.
 *  - `DonationRequestItem.condition` holds display copy ("No Stains"), NOT the
 *    backend `FurnitureConditionEnum` (excellent | good | fair | poor).
 *  - `request_id` and `submitted_at` are presentation fields; the backend
 *    `Donation` exposes `id` and `created_at`.
 *  - `pickup` is already resolved to the single active pickup — the backend
 *    returns a list and picks one via `services.donations.get_active_pickup`.
 * Everything else matches the schema field-for-field.
 */

/** Mirrors backend FurnitureStatus. Only the first three are reachable from this
 * screen; the rest are downstream states an item can arrive in from the API. */
export type ItemReviewStatus =
  | "PICKUP_PENDING" // awaiting review
  | "APPROVED"
  | "REJECTED"
  | "OFFERED"
  | "SCHEDULED"
  | "DELIVERED"
  | "CLOSED";

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
  furniture_items: DonationRequestItem[];
  pickup: DonationPickup | null;
}
