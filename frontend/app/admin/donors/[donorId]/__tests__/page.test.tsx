import { AxiosError, AxiosHeaders } from "axios";
import { fireEvent, render, screen } from "@testing-library/react";

import AdminDonorPage from "../page";
import {
  useDonor,
  useDonorDonations,
  useUpdateDonor,
} from "@/common/hooks/useApi";
import { donationDetails } from "@/mocks/fixtures/donationDetails";
import { donors } from "@/mocks/fixtures/donors";

jest.mock("@/common/hooks/useApi");

const mockPush = jest.fn();
const mockNotFound = jest.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ donorId: "donor-002" }),
  notFound: () => mockNotFound(),
}));

const donor = donors.find((d) => d.id === "donor-002")!;
const history = donationDetails.filter((d) => d.donor_id === donor.id);

function mockQueries({
  donorResult = { data: donor, error: null },
  donationsResult = { data: history, error: null },
}: {
  donorResult?: { data: unknown; error: unknown };
  donationsResult?: { data: unknown; error: unknown };
} = {}) {
  (useDonor as jest.Mock).mockReturnValue(donorResult);
  (useDonorDonations as jest.Mock).mockReturnValue(donationsResult);
  (useUpdateDonor as jest.Mock).mockReturnValue({ mutateAsync: jest.fn() });
}

describe("AdminDonorPage", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockNotFound.mockClear();
  });

  it("shows the donor's details and donation history", () => {
    mockQueries();

    render(<AdminDonorPage />);

    expect(screen.getByText("Donor Profile")).toBeInTheDocument();
    expect(screen.getByText(donor.email!)).toBeInTheDocument();
    expect(screen.getByText("Donation History")).toBeInTheDocument();
    expect(
      screen.getByText("Dining table & chairs / set, Sofa")
    ).toBeInTheDocument();
  });

  it("opens the donation request when a history row is clicked", () => {
    mockQueries();

    render(<AdminDonorPage />);
    fireEvent.click(screen.getByText("donation-002"));

    expect(mockPush).toHaveBeenCalledWith("/donation-request/donation-002");
  });

  it("shows skeletons until the data arrives", () => {
    mockQueries({
      donorResult: { data: undefined, error: null },
      donationsResult: { data: undefined, error: null },
    });

    render(<AdminDonorPage />);

    expect(
      screen.getByRole("status", { name: "Loading donor details" })
    ).toBeInTheDocument();
    expect(screen.getByText("Donation History")).toBeInTheDocument();
    expect(screen.queryByText(/total donations? made/)).not.toBeInTheDocument();
  });

  it("shows an error when the donation history fails to load", () => {
    mockQueries({
      donationsResult: { data: undefined, error: new Error("boom") },
    });

    render(<AdminDonorPage />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "We couldn't load this donor's donation history."
    );
    expect(screen.queryByText("Donation History")).not.toBeInTheDocument();
  });

  it("renders the not-found page for an unknown donor", () => {
    const notFoundError = new AxiosError("Not found", "404", undefined, null, {
      status: 404,
      statusText: "Not Found",
      data: {},
      headers: {},
      config: { headers: new AxiosHeaders() },
    });
    mockQueries({ donorResult: { data: undefined, error: notFoundError } });
    jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<AdminDonorPage />)).toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalled();
  });
});
