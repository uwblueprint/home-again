import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";

import { DonationItemCard } from "./DonationItemCard";
import type { DonationRequestItem } from "./types";

function makeItem(
  overrides: Partial<DonationRequestItem> = {}
): DonationRequestItem {
  return {
    id: "item-sofa",
    name: "Sofa",
    condition: "No Stains",
    status: "PICKUP_PENDING",
    rejection_reason: null,
    rejection_details: null,
    photos: [
      { url: "https://example.com/1.jpg", position: 0 },
      { url: "https://example.com/2.jpg", position: 1 },
    ],
    ...overrides,
  };
}

function renderCard(item: DonationRequestItem) {
  const onApprove = jest.fn();
  const onReject = jest.fn();
  render(
    <DonationItemCard item={item} onApprove={onApprove} onReject={onReject} />
  );
  return { onApprove, onReject };
}

describe("DonationItemCard", () => {
  it("shows Approve/Reject actions while the item is pending", () => {
    renderCard(makeItem());
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
  });

  it("approving confirms through the dialog and calls onApprove", () => {
    const { onApprove } = renderCard(makeItem());

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    fireEvent.click(
      screen.getByRole("button", { name: /confirm and approve/i })
    );

    expect(onApprove).toHaveBeenCalledWith("item-sofa");
  });

  it("renders the Approved badge and no actions once approved", () => {
    renderCard(makeItem({ status: "APPROVED" }));
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Approve" })
    ).not.toBeInTheDocument();
  });

  it("shows the rejection reason label when rejected without details", () => {
    renderCard(makeItem({ status: "REJECTED", rejection_reason: "condition" }));
    expect(screen.getByText("Reason for Rejection")).toBeInTheDocument();
    expect(screen.getByText("Item condition not suitable")).toBeInTheDocument();
  });

  it("prefers free-text details over the reason label when present", () => {
    renderCard(
      makeItem({
        status: "REJECTED",
        rejection_reason: "other",
        rejection_details: "Too large for the van",
      })
    );
    expect(screen.getByText("Too large for the van")).toBeInTheDocument();
  });

  it("opens the lightbox from the photo strip", () => {
    renderCard(makeItem());
    fireEvent.click(screen.getByRole("button", { name: /click to view/i }));

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("button", { name: /next photo/i })
    ).toBeInTheDocument();
  });
});
