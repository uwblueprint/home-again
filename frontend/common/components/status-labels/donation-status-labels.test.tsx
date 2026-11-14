import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";

import {
  DonationStatusBadge,
  type DonationHistoryStatus,
} from "./donation-status-labels";

describe("DonationStatusBadge", () => {
  it.each<[Exclude<DonationHistoryStatus, "approved_fraction">, string]>([
    ["unconfirmed", "Unconfirmed"],
    ["confirmed", "Confirmed"],
    ["picked_up", "Picked up"],
    ["rejected", "Rejected"],
    ["scheduled_by", "Scheduled"],
    ["pending_review", "Pending Review"],
    ["partially_reviewed", "Partially Reviewed"],
  ])("renders %s as %s", (status, label) => {
    render(<DonationStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("shows approved items out of the total", () => {
    render(
      <DonationStatusBadge status="approved_fraction" approved={2} total={3} />
    );
    expect(screen.getByText("2/3 Approved")).toBeInTheDocument();
  });

  it("shows the scheduled date when given one", () => {
    render(
      <DonationStatusBadge status="scheduled_by" scheduledDate="Mar 26" />
    );
    expect(screen.getByText("Scheduled Mar 26")).toBeInTheDocument();
  });

  it("ignores the scheduled date on other statuses", () => {
    render(<DonationStatusBadge status="confirmed" scheduledDate="Mar 26" />);
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
    expect(screen.queryByText(/Mar 26/)).toBeNull();
  });

  it("renders nothing for an unknown status", () => {
    const { container } = render(
      <DonationStatusBadge
        {...({ status: "bogus" } as unknown as ComponentProps<
          typeof DonationStatusBadge
        >)}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
