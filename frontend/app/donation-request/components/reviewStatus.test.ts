import { deriveReviewStatus, countApproved } from "./reviewStatus";
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

  it("treats downstream statuses as not-yet-reviewed, as the backend does", () => {
    const request = makeRequest([
      makeItem("a", "APPROVED"),
      makeItem("b", "OFFERED"),
    ]);
    expect(deriveReviewStatus(request)).toBe("partially_reviewed");
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
});
