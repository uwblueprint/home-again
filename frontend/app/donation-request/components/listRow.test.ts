import { DONATION_REQUEST_FIXTURE } from "./fixture";
import {
  deriveOutcomes,
  summarizeItems,
  toDonationRequestRow,
} from "./listRow";
import type { DonationRequest, ItemReviewStatus } from "./types";

function withItems(
  items: [name: string, status: ItemReviewStatus][],
  scheduledDate: string | null = null
): DonationRequest {
  return {
    ...DONATION_REQUEST_FIXTURE,
    furniture_items: items.map(([name, status], i) => ({
      ...DONATION_REQUEST_FIXTURE.furniture_items[0],
      id: `item-${i}`,
      name,
      status,
    })),
    pickup: scheduledDate
      ? {
          id: "p",
          scheduled_date: scheduledDate,
          note: null,
          confirmed_at: null,
        }
      : null,
  };
}

describe("summarizeItems", () => {
  it("counts repeated names in first-seen order", () => {
    const request = withItems([
      ["Bed Frame", "APPROVED"],
      ["Mattress", "APPROVED"],
      ["Bed Frame", "APPROVED"],
      ["Mattress", "APPROVED"],
    ]);
    expect(summarizeItems(request)).toBe("2 Bed Frame, 2 Mattress");
  });

  it("is empty with no items", () => {
    expect(summarizeItems(withItems([]))).toBe("");
  });
});

describe("deriveOutcomes", () => {
  it.each<[string, [string, ItemReviewStatus][], string[]]>([
    [
      "all approved",
      [
        ["Sofa", "APPROVED"],
        ["Chair", "OFFERED"],
      ],
      ["fully_approved", "unscheduled"],
    ],
    [
      "all rejected",
      [
        ["Sofa", "REJECTED"],
        ["Chair", "REJECTED"],
      ],
      ["fully_rejected", "unscheduled"],
    ],
    [
      "a mix",
      [
        ["Sofa", "APPROVED"],
        ["Chair", "REJECTED"],
      ],
      ["partially_approved", "unscheduled"],
    ],
    [
      "still pending",
      [
        ["Sofa", "APPROVED"],
        ["Chair", "PICKUP_PENDING"],
      ],
      ["unscheduled"],
    ],
    [
      "a mix that is still under review",
      [
        ["Sofa", "APPROVED"],
        ["Chair", "REJECTED"],
        ["Lamp", "PICKUP_PENDING"],
      ],
      ["unscheduled"],
    ],
    ["no items", [], ["unscheduled"]],
  ])("handles %s", (_case, items, expected) => {
    expect(deriveOutcomes(withItems(items))).toEqual(expected);
  });

  it("marks a request with a pickup date as scheduled", () => {
    const request = withItems([["Sofa", "APPROVED"]], "2026-04-02");
    expect(deriveOutcomes(request)).toEqual(["fully_approved", "scheduled"]);
  });
});

describe("toDonationRequestRow", () => {
  it("counts approved items out of the total", () => {
    const row = toDonationRequestRow(
      withItems([
        ["Sofa", "APPROVED"],
        ["Chair", "REJECTED"],
        ["Chair", "APPROVED"],
        ["Lamp", "REJECTED"],
      ])
    );
    expect(row.status).toBe("reviewed");
    expect([row.approvedCount, row.itemCount]).toEqual([2, 4]);
  });

  it("counts items past approval as approved", () => {
    const row = toDonationRequestRow(
      withItems([
        ["Sofa", "OFFERED"],
        ["Chair", "SCHEDULED"],
      ])
    );
    expect([row.approvedCount, row.itemCount]).toEqual([2, 2]);
    expect(row.outcomes).toContain("fully_approved");
  });

  it("flattens the request", () => {
    const request = withItems(
      [
        ["Sofa", "APPROVED"],
        ["Sofa", "APPROVED"],
      ],
      "2026-04-02"
    );
    expect(toDonationRequestRow(request)).toEqual({
      id: "donation-req-001",
      donorName: "Katie Sun",
      requestId: "DR-2026-0042",
      submittedAt: "2026-03-14",
      items: "2 Sofa",
      status: "scheduled",
      approvedCount: 2,
      itemCount: 2,
      scheduledDate: "2026-04-02",
      outcomes: ["fully_approved", "scheduled"],
    });
  });
});
