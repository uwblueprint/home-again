import { fireEvent, render, screen, within } from "@testing-library/react";

import { donationRequests } from "@/mocks/fixtures/donationRequests";
import DonationRequestsPage from "../page";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockDonationDetails = jest.fn();
jest.mock("@/common/hooks/useApi", () => ({
  useDonationDetails: () => mockDonationDetails(),
}));

function rows() {
  return screen.getAllByTestId(/^donation-requests-table-row-/);
}

function clickTab(name: RegExp) {
  fireEvent.click(screen.getByRole("tab", { name }));
}

// The sidebar's useIsMobile reads matchMedia, which jsdom doesn't implement.
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  });
});

describe("DonationRequestsPage", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockDonationDetails.mockReturnValue({
      data: donationRequests,
      isLoading: false,
      error: null,
    });
  });

  it("shows the review-status tabs with counts", () => {
    render(<DonationRequestsPage />);
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "All (65)",
      "Pending (12)",
      "Partially Reviewed (3)",
      "Reviewed (50)",
    ]);
    expect(screen.getByText("1 - 10 of 65 results")).toBeInTheDocument();
  });

  it("renders the toolbar above the table card", () => {
    render(<DonationRequestsPage />);
    const card = screen.getByTestId("donation-requests-table");
    expect(
      within(card).queryByPlaceholderText("Search for donation")
    ).toBeNull();
    expect(screen.getByPlaceholderText("Search for donation")).toBeVisible();
  });

  it("sorts oldest first by default", () => {
    render(<DonationRequestsPage />);
    expect(within(rows()[0]).getByText("18 January 2026")).toBeInTheDocument();
  });

  it("filters rows by tab", () => {
    render(<DonationRequestsPage />);
    clickTab(/^Pending/);
    expect(screen.getByText("1 - 10 of 12 results")).toBeInTheDocument();
    for (const row of rows()) {
      expect(within(row).getByText("Pending Review")).toBeInTheDocument();
    }
  });

  it("shows the pickup date on scheduled requests under Reviewed", () => {
    render(<DonationRequestsPage />);
    clickTab(/^Reviewed/);
    // e.g. "Scheduled Feb 17"
    expect(
      screen.getAllByText(/^Scheduled [A-Z][a-z]{2} \d{1,2}$/).length
    ).toBeGreaterThan(0);
  });

  it("shows approved counts on reviewed, unscheduled requests", () => {
    render(<DonationRequestsPage />);
    clickTab(/^Reviewed/);
    // e.g. "2/4 Approved"
    expect(screen.getAllByText(/^\d+\/\d+ Approved$/).length).toBeGreaterThan(
      0
    );
  });

  it("filters by outcome from the Filter menu", () => {
    render(<DonationRequestsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Filter" }));
    fireEvent.click(
      screen.getByRole("menuitemcheckbox", { name: "Scheduled" })
    );
    const scheduled = donationRequests.filter(
      (d) => d.pickup?.scheduled_date
    ).length;
    expect(
      screen.getByText(`1 - 10 of ${scheduled} results`)
    ).toBeInTheDocument();
  });

  it("opens a request's detail page on row click", () => {
    render(<DonationRequestsPage />);
    fireEvent.change(screen.getByPlaceholderText("Search for donation"), {
      target: { value: "Katie" },
    });
    fireEvent.click(screen.getAllByText("Katie Sun")[0]);
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringMatching(/^\/donation-request\/donation-req-\d{3}$/)
    );
  });

  it("shows a loading state while the requests load", () => {
    mockDonationDetails.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    render(<DonationRequestsPage />);
    expect(screen.queryAllByTestId(/^donation-requests-table-row-/)).toEqual(
      []
    );
  });
});
