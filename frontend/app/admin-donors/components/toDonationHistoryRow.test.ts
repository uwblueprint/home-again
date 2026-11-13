import type { DonationDetail, FurnitureStatus } from "@/common/types";
import { donationDetails } from "@/mocks/fixtures/donationDetails";
import { toDonationHistoryRow } from "./toDonationHistoryRow";

const [pendingDonation] = donationDetails;

function makeDonation(overrides: Partial<DonationDetail> = {}): DonationDetail {
  return { ...pendingDonation, ...overrides };
}

function withItemStatuses(...statuses: FurnitureStatus[]) {
  return statuses.map((status, i) => ({
    ...pendingDonation.furniture_items[0],
    id: `item-${i}`,
    status,
  }));
}

const scheduledPickup = {
  id: "pickup-1",
  route_id: null,
  donation_id: pendingDonation.id,
  scheduled_date: "2026-03-26T00:00:00",
  note: null,
  confirmed_at: null,
  created_at: "2026-03-15T00:00:00",
  updated_at: "2026-03-15T00:00:00",
};

describe("toDonationHistoryRow", () => {
  it("maps the date, id and item names", () => {
    expect(toDonationHistoryRow(pendingDonation)).toEqual({
      donationDate: pendingDonation.created_at,
      donationId: pendingDonation.id,
      items: ["Queen Bed Frame", "Dresser"],
      status: "pending_review",
      approvedCount: 0,
    });
  });

  it.each([
    ["pending_review", "pending_review"],
    ["partially_reviewed", "partially_reviewed"],
    ["reviewed", "approved_fraction"],
  ] as const)("shows %s review as %s", (reviewStatus, expected) => {
    const donation = makeDonation({
      review_status: reviewStatus,
      furniture_items: withItemStatuses("APPROVED", "PICKUP_PENDING"),
    });
    expect(toDonationHistoryRow(donation).status).toBe(expected);
  });

  it("shows a scheduled pickup as scheduled until it's confirmed", () => {
    const scheduled = makeDonation({
      review_status: "scheduled",
      pickup: scheduledPickup,
    });
    expect(toDonationHistoryRow(scheduled).status).toBe("scheduled_by");

    const confirmed = makeDonation({
      review_status: "scheduled",
      pickup: { ...scheduledPickup, confirmed_at: "2026-03-16T00:00:00" },
    });
    expect(toDonationHistoryRow(confirmed).status).toBe("confirmed");
  });

  it("counts only approved items", () => {
    const donation = makeDonation({
      review_status: "reviewed",
      furniture_items: withItemStatuses("APPROVED", "REJECTED", "APPROVED"),
    });
    const row = toDonationHistoryRow(donation);
    expect(row.approvedCount).toBe(2);
    expect(row.items).toHaveLength(3);
  });

  it("carries the pickup's scheduled date, if any", () => {
    const scheduled = makeDonation({
      review_status: "scheduled",
      pickup: scheduledPickup,
    });
    expect(toDonationHistoryRow(scheduled).scheduledDate).toBe(
      scheduledPickup.scheduled_date
    );
    expect(
      toDonationHistoryRow(makeDonation({ pickup: null })).scheduledDate
    ).toBeUndefined();
  });

  it("shows rejected when every item was rejected", () => {
    const donation = makeDonation({
      review_status: "reviewed",
      furniture_items: withItemStatuses("REJECTED", "REJECTED"),
    });
    expect(toDonationHistoryRow(donation).status).toBe("rejected");
  });

  it("shows a completed donation as picked up, whatever its review state", () => {
    const donation = makeDonation({
      status: "completed",
      review_status: "scheduled",
      pickup: scheduledPickup,
    });
    expect(toDonationHistoryRow(donation).status).toBe("picked_up");
  });
});
