import { render, screen } from "@testing-library/react";

import DonationRequestPage from "../page";
import { useDonationDetail } from "@/common/hooks/useApi";
import { useDonationRequestStore } from "@/app/donation-request/stores/donationRequestStore";
import { donationDetails } from "@/mocks/fixtures/donationDetails";

jest.mock("@/common/hooks/useApi");
// jsdom has no matchMedia, which the sidebar uses to detect mobile.
jest.mock("@/common/hooks/use-mobile", () => ({ useIsMobile: () => false }));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useParams: () => ({ id: "donation-002" }),
  usePathname: () => "/donation-request/donation-002",
  notFound: jest.fn(),
}));

const donation = donationDetails.find((d) => d.id === "donation-002")!;

describe("DonationRequestPage", () => {
  beforeEach(() => {
    useDonationRequestStore.getState().reset();
  });

  it("shows a skeleton instead of the previous request", () => {
    (useDonationDetail as jest.Mock).mockReturnValue({
      data: undefined,
      error: null,
    });

    render(<DonationRequestPage />);

    expect(
      screen.getByRole("status", { name: "Loading donation request" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Katie")).not.toBeInTheDocument();
  });

  it("renders the fetched donation", async () => {
    (useDonationDetail as jest.Mock).mockReturnValue({
      data: donation,
      error: null,
    });

    render(<DonationRequestPage />);

    expect(await screen.findByText("2 Items Donated")).toBeInTheDocument();
    expect(screen.getByText("Robert")).toBeInTheDocument();
    expect(screen.getByText("Dining table & chairs / set")).toBeInTheDocument();
  });
});
