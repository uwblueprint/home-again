import { donationRequests } from "@/mocks/fixtures/donationRequests";
import type { DonationDetail, FurnitureStatus } from "@/common/types";
import {
  deriveOutcomes,
  summarizeItems,
  toDonationRequestRow,
} from "./listRow";

const BASE = donationRequests[0];

function withItems(
  items: [name: string, status: FurnitureStatus][],
  scheduledDate: string | null = null
): DonationDetail {
  return {
    ...BASE,
    furniture_items: items.map(([name, status], i) => ({
      ...BASE.furniture_items[0],
      id: `item-${i}`,
      name,
      status,
    })),
    pickup: scheduledDate
      ? {
          id: "p",
          route_id: null,
          donation_id: BASE.id,
          scheduled_date: scheduledDate,
          note: null,
          confirmed_at: null,
          created_at: BASE.created_at,
          updated_at: BASE.created_at,
        }
      : null,
  };
}

describe("summarizeItems", () => {
  it("counts repeated names in first-seen order", () => {
    expect(
      summarizeItems(["Bed Frame", "Mattress", "Bed Frame", "Mattress"])
    ).toBe("2 Bed Frame, 2 Mattress");
  });

  it("is empty for no items", () => {
    expect(summarizeItems([])).toBe("");
  });
});

describe("deriveOutcomes", () => {
  it("is fully approved when every item passed review", () => {
    const outcomes = deriveOutcomes(
      withItems([
        ["Sofa", "APPROVED"],
        ["Chair", "OFFERED"],
      ])
    );
    expect(outcomes).toEqual(["fully_approved", "unscheduled"]);
  });

  it("is fully rejected when every item was rejected", () => {
    expect(deriveOutcomes(withItems([["Sofa", "REJECTED"]]))).toEqual([
      "fully_rejected",
      "unscheduled",
    ]);
  });

  it("is partially approved for a mix, and scheduled with a pickup date", () => {
    const outcomes = deriveOutcomes(
      withItems(
        [
          ["Sofa", "APPROVED"],
          ["Chair", "REJECTED"],
        ],
        "2026-04-02T00:00:00"
      )
    );
    expect(outcomes).toEqual(["partially_approved", "scheduled"]);
  });

  it("matches no review outcome while items are pending", () => {
    expect(deriveOutcomes(withItems([["Sofa", "PICKUP_PENDING"]]))).toEqual([
      "unscheduled",
    ]);
  });
});

describe("toDonationRequestRow", () => {
  it("flattens the donation using the backend's status and counts", () => {
    const donation: DonationDetail = {
      ...withItems(
        [
          ["Sofa", "APPROVED"],
          ["Sofa", "APPROVED"],
        ],
        "2026-04-02T00:00:00"
      ),
      id: "3f2a9c1e-0000-4000-8000-000000000000",
      created_at: "2026-03-14T09:30:00",
      review_status: "scheduled",
      approved_count: 2,
      item_count: 2,
    };
    expect(toDonationRequestRow(donation)).toEqual({
      id: "3f2a9c1e-0000-4000-8000-000000000000",
      donorName: "Katie Sun",
      requestId: "3F2A9C1E",
      submittedAt: "2026-03-14",
      items: "2 Sofa",
      status: "scheduled",
      approvedCount: 2,
      itemCount: 2,
      scheduledDate: "2026-04-02",
      outcomes: ["fully_approved", "scheduled"],
    });
  });

  it("shows the local submitted date, not the UTC one", () => {
    // 01:00 UTC on Mar 15 is 9:30pm Mar 14 in St. John's (Jest's timezone).
    const row = toDonationRequestRow({
      ...BASE,
      created_at: "2026-03-15T01:00:00",
    });
    expect(row.submittedAt).toBe("2026-03-14");
  });

  it("keeps the pickup's calendar date as stored", () => {
    const row = toDonationRequestRow(
      withItems([["Sofa", "APPROVED"]], "2026-04-02T00:00:00")
    );
    expect(row.scheduledDate).toBe("2026-04-02");
  });

  it("shows a dash when the donor is missing", () => {
    const row = toDonationRequestRow({ ...BASE, donor: null });
    expect(row.donorName).toBe("—");
  });
});
