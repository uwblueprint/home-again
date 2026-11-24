import {
  deriveReviewStatus,
  deriveDonationReviewStatus,
  countApproved,
} from "./reviewStatus";
import type {
  DonationRequest,
  DonationRequestItem,
  ItemReviewStatus,
} from "./types";

function makeItem(id: string, status: ItemReviewStatus): DonationRequestItem {
  return {
    id,
    name: id,
    condition: "No Stains",
    status,
    rejection_reason: null,
    rejection_details: null,
    photos: [],
  };
}

function makeRequest(
  items: DonationRequestItem[],
  pickup: DonationRequest["pickup"] = null
): DonationRequest {
  return {
    id: "req",
    request_id: "REQUEST ID",
    submitted_at: "2026-03-14",
    donor: {
      first_name: "Katie",
      last_name: "Sun",
      email: "katie@example.com",
      phone: "555",
      smoking_household: false,
      has_pets: false,
      pickup_address: "210 Drake Ave",
    },
    furniture_items: items,
    pickup,
  };
}

const SCHEDULED_PICKUP: DonationRequest["pickup"] = {
  id: "p1",
  scheduled_date: "2026-03-26",
  note: null,
  confirmed_at: null,
};

describe("deriveReviewStatus", () => {
  it("is pending_review when a donation has no items", () => {
    expect(deriveReviewStatus(makeRequest([]))).toBe("pending_review");
  });

  it("is pending_review when no item has been reviewed", () => {
    const request = makeRequest([
      makeItem("a", "PICKUP_PENDING"),
      makeItem("b", "PICKUP_PENDING"),
    ]);
    expect(deriveReviewStatus(request)).toBe("pending_review");
  });

  it("is partially_reviewed when some but not all items are reviewed", () => {
    const request = makeRequest([
      makeItem("a", "APPROVED"),
      makeItem("b", "PICKUP_PENDING"),
    ]);
    expect(deriveReviewStatus(request)).toBe("partially_reviewed");
  });

  it("is reviewed when every item is approved or rejected", () => {
    const request = makeRequest([
      makeItem("a", "APPROVED"),
      makeItem("b", "REJECTED"),
    ]);
    expect(deriveReviewStatus(request)).toBe("reviewed");
  });

  it("is scheduled once every item is reviewed and a pickup has a date", () => {
    const request = makeRequest(
      [makeItem("a", "APPROVED"), makeItem("b", "REJECTED")],
      SCHEDULED_PICKUP
    );
    expect(deriveReviewStatus(request)).toBe("scheduled");
  });

  // Mirrors compute_review_status: "a pickup booked while items are still
  // outstanding must not hide that they need attention."
  it("does not let a scheduled pickup mask items still awaiting review", () => {
    const request = makeRequest(
      [makeItem("a", "APPROVED"), makeItem("b", "PICKUP_PENDING")],
      SCHEDULED_PICKUP
    );
    expect(deriveReviewStatus(request)).toBe("partially_reviewed");
  });

  it("does not let a scheduled pickup mask a wholly unreviewed donation", () => {
    const request = makeRequest(
      [makeItem("a", "PICKUP_PENDING")],
      SCHEDULED_PICKUP
    );
    expect(deriveReviewStatus(request)).toBe("pending_review");
  });

  it("counts downstream statuses as reviewed, as the backend does", () => {
    const request = makeRequest([
      makeItem("a", "APPROVED"),
      makeItem("b", "OFFERED"),
    ]);
    expect(deriveReviewStatus(request)).toBe("reviewed");
  });

  it("ignores a pickup with no scheduled date", () => {
    const request = makeRequest([makeItem("a", "APPROVED")], {
      id: "p1",
      scheduled_date: null,
      note: "draft",
      confirmed_at: null,
    });
    expect(deriveReviewStatus(request)).toBe("reviewed");
  });
});

describe("countApproved", () => {
  it("counts only approved items", () => {
    const request = makeRequest([
      makeItem("a", "APPROVED"),
      makeItem("b", "REJECTED"),
      makeItem("c", "APPROVED"),
      makeItem("d", "PICKUP_PENDING"),
    ]);
    expect(countApproved(request)).toBe(2);
  });

  it("counts items that moved past approval as approved", () => {
    const request = makeRequest([
      makeItem("a", "OFFERED"),
      makeItem("b", "SCHEDULED"),
      makeItem("c", "DELIVERED"),
      makeItem("d", "CLOSED"),
      makeItem("e", "REJECTED"),
    ]);
    expect(countApproved(request)).toBe(4);
  });
});

describe("deriveDonationReviewStatus", () => {
  const items = (...statuses: ItemReviewStatus[]) =>
    statuses.map((status, i) => makeItem(`i${i}`, status));

  it.each<[string, ItemReviewStatus[], string]>([
    [
      "nothing reviewed",
      ["PICKUP_PENDING", "PICKUP_PENDING"],
      "pending_review",
    ],
    ["some reviewed", ["APPROVED", "PICKUP_PENDING"], "partially_reviewed"],
    ["every item approved", ["APPROVED", "DELIVERED"], "approved"],
    [
      "some approved, some rejected",
      ["APPROVED", "REJECTED"],
      "partially_approved",
    ],
    ["every item rejected", ["REJECTED", "REJECTED"], "rejected"],
  ])("%s → %s", (_label, statuses, expected) => {
    expect(deriveDonationReviewStatus(makeRequest(items(...statuses)))).toBe(
      expected
    );
  });

  it("shows a booked pickup as scheduled, then confirmed", () => {
    const approved = items("APPROVED", "REJECTED");
    expect(
      deriveDonationReviewStatus(makeRequest(approved, SCHEDULED_PICKUP))
    ).toBe("scheduled");
    expect(
      deriveDonationReviewStatus(
        makeRequest(approved, {
          ...SCHEDULED_PICKUP!,
          confirmed_at: "2026-03-20T00:00:00",
        })
      )
    ).toBe("confirmed");
  });

  it("keeps a fully rejected request rejected, even with a pickup", () => {
    expect(
      deriveDonationReviewStatus(
        makeRequest(items("REJECTED"), SCHEDULED_PICKUP)
      )
    ).toBe("rejected");
  });

  it("reports picked up over everything else", () => {
    expect(
      deriveDonationReviewStatus(makeRequest(items("PICKUP_PENDING")), true)
    ).toBe("picked_up");
  });
});
