import { donationDetails } from "@/mocks/fixtures/donationDetails";
import { toDonationRequest } from "./toDonationRequest";

// Has a second address line, a rejected item and a scheduled pickup.
const donation = donationDetails[1];

describe("toDonationRequest", () => {
  it("flattens the donor and donation-level household answers", () => {
    expect(toDonationRequest(donation).donor).toEqual({
      first_name: "Robert",
      last_name: "Chen",
      email: donation.donor!.email,
      phone: donation.donor!.phone,
      smoking_household: false,
      has_pets: true,
      pickup_address: "12 Elm Street, Unit 4, Ottawa, K2P 1L4",
    });
  });

  it("uses empty strings when the donor is missing", () => {
    const { donor } = toDonationRequest({ ...donation, donor: null });
    expect(donor.first_name).toBe("");
    expect(donor.email).toBe("");
  });

  it("keeps review state and orders photos by position", () => {
    const [, sofa] = toDonationRequest({
      ...donation,
      furniture_items: donation.furniture_items.map((item) => ({
        ...item,
        photos: [...item.photos].reverse(),
      })),
    }).furniture_items;

    expect(sofa).toMatchObject({
      name: "Sofa",
      condition: "No Stains",
      status: "REJECTED",
      rejection_reason: "condition",
      rejection_details: "Visible stains on cushions",
    });
    expect(sofa.photos.map((photo) => photo.position)).toEqual([0, 1, 2, 3, 4]);
  });

  it("falls back to the cover image for items without photos", () => {
    const [item] = toDonationRequest({
      ...donation,
      furniture_items: [{ ...donation.furniture_items[0], photos: [] }],
    }).furniture_items;
    expect(item.photos).toEqual([
      { url: "/sample-furniture.jpg", position: 0 },
    ]);
  });

  it("trims the pickup's scheduled datetime to a date", () => {
    expect(toDonationRequest(donation).pickup).toEqual({
      id: "pickup-002",
      scheduled_date: "2026-03-26",
      note: "Donor prefers afternoon pickup",
      confirmed_at: null,
    });
    expect(toDonationRequest(donationDetails[0]).pickup).toBeNull();
  });
});
