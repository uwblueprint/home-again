import { fireEvent, render, screen, within } from "@testing-library/react";

import { HistoryTable } from "./HistoryTable";
import type { DonationHistoryRow } from "./HistoryTableColumns";

function makeRow(
  overrides: Partial<DonationHistoryRow> = {}
): DonationHistoryRow {
  return {
    donationDate: "2026-03-14T15:00:00Z",
    donationId: "donation-1",
    items: ["Sofa", "Lamp"],
    status: "pending_review",
    approvedCount: 0,
    ...overrides,
  };
}

// Given out of date order, so the default newest-first sort is visible.
const rows: DonationHistoryRow[] = [
  makeRow({ donationId: "middle", donationDate: "2026-02-10T15:00:00Z" }),
  makeRow({ donationId: "newest", donationDate: "2026-03-20T15:00:00Z" }),
  makeRow({ donationId: "oldest", donationDate: "2026-01-05T15:00:00Z" }),
];

/** Text of each cell in one row, left to right. */
function rowText(rowIndex: number) {
  return within(screen.getByTestId(`data-table-row-${rowIndex}`))
    .getAllByRole("cell")
    .map((cell) => cell.textContent);
}

function donationIds() {
  return screen
    .getAllByTestId(/^data-table-row-/)
    .map((row) => within(row).getAllByRole("cell")[1].textContent);
}

describe("HistoryTable", () => {
  it("renders the title, donation count and columns", () => {
    render(<HistoryTable data={rows} />);

    expect(
      screen.getByRole("heading", { name: "Donation History" })
    ).toBeInTheDocument();
    expect(screen.getByText("3 total donations made")).toBeInTheDocument();
    expect(
      screen.getAllByRole("columnheader").map((th) => th.textContent)
    ).toEqual(["Donation Date", "Donation ID", "Items", "Status"]);
  });

  it("renders a row's values", () => {
    render(<HistoryTable data={[makeRow()]} />);
    expect(rowText(0)).toEqual([
      "March 14, 2026",
      "donation-1",
      "Sofa, Lamp",
      "Pending Review",
    ]);
  });

  it('shows "—" for a missing date or no items', () => {
    render(<HistoryTable data={[makeRow({ donationDate: "", items: [] })]} />);
    const [date, , items] = rowText(0);
    expect(date).toBe("—");
    expect(items).toBe("—");
  });

  it("shows a date-only value on its own day, not the day before", () => {
    render(<HistoryTable data={[makeRow({ donationDate: "2026-03-14" })]} />);
    expect(rowText(0)[0]).toBe("March 14, 2026");
  });

  it("shows a reviewed donation's approved items out of its total", () => {
    render(
      <HistoryTable
        data={[
          makeRow({
            status: "approved_fraction",
            items: ["Sofa", "Lamp", "Rug"],
            approvedCount: 2,
          }),
        ]}
      />
    );
    expect(rowText(0)[3]).toBe("2/3 Approved");
  });

  it("shows the pickup date on a scheduled badge", () => {
    render(
      <HistoryTable
        data={[
          makeRow({
            status: "scheduled_by",
            scheduledDate: "2026-03-26T00:00:00",
          }),
        ]}
      />
    );
    expect(screen.getByText("Scheduled Mar 26")).toBeInTheDocument();
  });

  it("sorts newest first", () => {
    render(<HistoryTable data={rows} />);
    expect(donationIds()).toEqual(["newest", "middle", "oldest"]);
  });

  it("calls onRowClick with the clicked row and shows the chevron", () => {
    const onRowClick = jest.fn();
    render(<HistoryTable data={rows} onRowClick={onRowClick} />);

    // The chevron adds a fifth, empty cell.
    expect(rowText(0)).toHaveLength(5);

    // Row test ids use the original data index, not the sorted position.
    fireEvent.click(screen.getByTestId("data-table-row-0"));
    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });

  it("has no chevron without onRowClick", () => {
    render(<HistoryTable data={rows} />);
    expect(rowText(0)).toHaveLength(4);
  });

  it("shows a zero count and the empty state with no donations", () => {
    render(<HistoryTable data={[]} />);
    expect(screen.getByText("0 total donations made")).toBeInTheDocument();
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("shows skeleton rows instead of a count or empty state while loading", () => {
    render(<HistoryTable data={[]} loading />);
    expect(screen.getByText("Donation History")).toBeInTheDocument();
    expect(screen.queryByText(/total donations? made/)).not.toBeInTheDocument();
    expect(screen.queryByText("No results found")).not.toBeInTheDocument();
  });
});
