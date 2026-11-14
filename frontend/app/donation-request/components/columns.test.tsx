import { render, screen } from "@testing-library/react";

import { ReviewStatusBadge } from "./columns";

describe("ReviewStatusBadge", () => {
  it.each([
    ["pending_review", "Pending Review"],
    ["partially_reviewed", "Partially Reviewed"],
    ["rejected", "Rejected"],
    ["confirmed", "Confirmed"],
    ["picked_up", "Picked up"],
  ] as const)("shows %s as %s", (status, label) => {
    render(<ReviewStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it.each(["approved", "partially_approved"] as const)(
    "shows %s as an approved fraction",
    (status) => {
      render(
        <ReviewStatusBadge status={status} approvedCount={2} itemCount={4} />
      );
      expect(screen.getByText("2/4 Approved")).toBeInTheDocument();
    }
  );

  it("shows the pickup date on scheduled requests", () => {
    render(<ReviewStatusBadge status="scheduled" scheduledDate="2026-03-14" />);
    expect(screen.getByText("Scheduled Mar 14")).toBeInTheDocument();
  });
});
