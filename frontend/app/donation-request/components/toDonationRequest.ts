import type { DonationDetail, DonationItemDetail } from "@/common/types";
import type { DonationRequest, DonationRequestItem } from "./types";

/** Backend datetimes are naive UTC; the view model wants a yyyy-mm-dd date. */
function toDateOnly(value: string | null): string | null {
  return value ? value.slice(0, 10) : null;
}

function toPickupAddress(donation: DonationDetail): string {
  return [
    donation.address_line_1,
    donation.address_line_2,
    donation.city,
    donation.postal_code,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
}

function toItem(item: DonationItemDetail): DonationRequestItem {
  const photos = item.photos.length
    ? item.photos.map(({ url, position }) => ({ url, position }))
    : // Items submitted before multi-photo upload only have their cover image.
      [{ url: item.image_url, position: 0 }];

  return {
    id: item.id,
    name: item.name,
    // The line under the item name in the design ("No Stains") is the donor's
    // description, not the condition enum.
    condition: item.description,
    status: item.status,
    rejection_reason: item.rejection_reason,
    rejection_details: item.rejection_details,
    photos: [...photos].sort((a, b) => a.position - b.position),
  };
}

/** Shapes `GET /donations/{id}/detail` into the review screen's view model. */
export function toDonationRequest(donation: DonationDetail): DonationRequest {
  const { donor, pickup } = donation;

  return {
    id: donation.id,
    // The backend has no separate human-facing request number yet.
    request_id: donation.id,
    submitted_at: donation.created_at,
    donor: {
      first_name: donor?.first_name ?? "",
      last_name: donor?.last_name ?? "",
      email: donor?.email ?? "",
      phone: donor?.phone ?? "",
      smoking_household: donation.smoking_household,
      has_pets: donation.has_pets,
      pickup_address: toPickupAddress(donation),
    },
    furniture_items: donation.furniture_items.map(toItem),
    pickup: pickup
      ? {
          id: pickup.id,
          scheduled_date: toDateOnly(pickup.scheduled_date),
          note: pickup.note,
          confirmed_at: pickup.confirmed_at,
        }
      : null,
  };
}
