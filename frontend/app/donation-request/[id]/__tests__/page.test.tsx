import { act, render, screen } from "@testing-library/react";
import { AxiosError, AxiosHeaders } from "axios";
import { notFound } from "next/navigation";

import DonationRequestPage from "../page";
import { useDonationDetail } from "@/common/hooks/useApi";
import { useDonationRequestStore } from "@/app/donation-request/stores/donationRequestStore";
import {
  DONATION_REQUEST_SAMPLES,
  toDonationRequest,
} from "@/app/donation-request/components";
import { donationDetails } from "@/mocks/fixtures/donationDetails";

jest.mock("@/common/hooks/useApi");
// jsdom has no matchMedia, which the sidebar uses to detect mobile.
jest.mock("@/common/hooks/use-mobile", () => ({ useIsMobile: () => false }));

let mockId = "donation-002";
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useParams: () => ({ id: mockId }),
  usePathname: () => `/donation-request/${mockId}`,
  notFound: jest.fn(),
}));

const scheduled = donationDetails.find((d) => d.id === "donation-002")!;
const pending = donationDetails.find((d) => d.id === "donation-001")!;

function mockDetail(data: unknown, error: unknown = null) {
  (useDonationDetail as jest.Mock).mockReturnValue({ data, error });
}

function notFoundError() {
  const headers = new AxiosHeaders();
  return new AxiosError("Not Found", "ERR_BAD_REQUEST", { headers }, null, {
    status: 404,
    statusText: "Not Found",
    data: {},
    headers: {},
    config: { headers },
  });
}

describe("DonationRequestPage", () => {
  beforeEach(() => {
    mockId = "donation-002";
    useDonationRequestStore.getState().reset();
    jest.clearAllMocks();
  });

  it("shows a skeleton while the donation loads", () => {
    mockDetail(undefined);

    render(<DonationRequestPage />);

    expect(
      screen.getByRole("status", { name: "Loading donation request" })
    ).toBeInTheDocument();
  });

  it("renders the fetched donation", () => {
    mockDetail(scheduled);

    render(<DonationRequestPage />);

    expect(screen.getByText("2 Items Donated")).toBeInTheDocument();
    expect(screen.getByText("Robert")).toBeInTheDocument();
    expect(screen.getByText("Dining table & chairs / set")).toBeInTheDocument();
  });

  it("shows the server's review status", () => {
    // The items alone would read as scheduled; the server's status wins.
    mockDetail({ ...scheduled, review_status: "picked_up" });

    render(<DonationRequestPage />);

    expect(screen.getByText("Picked up")).toBeInTheDocument();
  });

  it("keeps unsaved review edits when the donation is refetched", () => {
    mockId = pending.id;
    mockDetail(pending);
    const { rerender, unmount } = render(<DonationRequestPage />);
    expect(screen.getByText("Pending Review")).toBeInTheDocument();

    const { addRequest, approveItem } = useDonationRequestStore.getState();
    act(() => {
      addRequest(toDonationRequest(pending));
      approveItem(pending.id, pending.furniture_items[0].id);
    });

    // A refetch hands back a new object with the server's (unchanged) data.
    mockDetail(JSON.parse(JSON.stringify(pending)));
    rerender(<DonationRequestPage />);
    expect(screen.getByText("Partially Reviewed")).toBeInTheDocument();

    // So does coming back to the page.
    unmount();
    render(<DonationRequestPage />);
    expect(screen.getByText("Partially Reviewed")).toBeInTheDocument();
  });

  it("shows a request the store already has, even if the API doesn't", () => {
    const [sample] = DONATION_REQUEST_SAMPLES;
    mockId = sample.id;
    mockDetail(undefined, notFoundError());

    render(<DonationRequestPage />);

    expect(notFound).not.toHaveBeenCalled();
    expect(
      screen.getByText(`${sample.furniture_items.length} Items Donated`)
    ).toBeInTheDocument();
  });

  it("renders the not-found page for an unknown id", () => {
    mockId = "missing";
    mockDetail(undefined, notFoundError());

    render(<DonationRequestPage />);

    expect(notFound).toHaveBeenCalled();
  });
});
