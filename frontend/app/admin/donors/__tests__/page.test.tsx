import { fireEvent, render, screen } from "@testing-library/react";

import AdminDonorsPage from "../page";
import { useDonors } from "@/common/hooks/useApi";
import type { DonorListItem } from "@/common/types";

jest.mock("@/common/hooks/useApi");

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const donor: DonorListItem = {
  id: "donor-001",
  name: "Katie Sun",
  first_name: "Katie",
  last_name: "Sun",
  email: "katiesun@uwblueprint.org",
  phone: "6479099581",
  address: null,
  city: null,
  postal_code: null,
  country: null,
  smoking_household: null,
  donation_type: null,
  is_anonymous: false,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  donation_count: 3,
  last_donated_at: "2026-02-01T00:00:00Z",
};

function mockDonors(result: Partial<ReturnType<typeof useDonors>>) {
  (useDonors as jest.Mock).mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
    ...result,
  });
}

describe("AdminDonorsPage", () => {
  beforeEach(() => {
    mockPush.mockReset();
  });

  it("lists donors from the API", () => {
    mockDonors({ data: [donor] });

    render(<AdminDonorsPage />);

    expect(screen.getByText("Katie")).toBeInTheDocument();
    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("katiesun@uwblueprint.org")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("opens the donor's profile when a row is clicked", () => {
    mockDonors({ data: [donor] });

    render(<AdminDonorsPage />);
    fireEvent.click(screen.getByText("katiesun@uwblueprint.org"));

    expect(mockPush).toHaveBeenCalledWith("/admin/donors/donor-001");
  });

  it("shows the empty state when there are no donors", () => {
    mockDonors({ data: [] });

    render(<AdminDonorsPage />);

    expect(screen.getByText("No donors found")).toBeInTheDocument();
  });
});
