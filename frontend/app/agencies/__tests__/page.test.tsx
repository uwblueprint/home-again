import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AgenciesPage from "../page";
import { useAgencies } from "@/hooks/useApi";

jest.mock("@/hooks/useApi");

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const sample = [
  {
    id: "1",
    name: "Test Agency",
    email: "a@test.com",
    phone: "123",
    address: "",
    city: "Metropolis",
    province: "NY",
    description: null,
    status: "active",
    require_pre_payment: false,
    billing_profiles: null,
    created_at: "",
    updated_at: "",
  },
];

describe("AgenciesPage integration", () => {
  beforeEach(() => {
    (useAgencies as jest.Mock).mockReset();
  });

  it("renders list and allows view action", () => {
    (useAgencies as jest.Mock).mockReturnValue({
      data: sample,
      isLoading: false,
      error: null,
    });

    render(<AgenciesPage />);

    expect(screen.getByText("Test Agency")).toBeInTheDocument();

    // click view action
    fireEvent.click(screen.getByTestId("action-view-1"));
    expect(mockPush).toHaveBeenCalledWith("/agencies/1");
  });

  it("shows empty state when there are no agencies", () => {
    (useAgencies as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<AgenciesPage />);
    expect(screen.getByText(/no agencies yet/i)).toBeInTheDocument();
  });

  it("shows loading skeleton when loading", () => {
    (useAgencies as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });

    render(<AgenciesPage />);
    // skeleton appears; we can check that the resource-list container exists
    expect(screen.getByTestId("agencies-list")).toBeInTheDocument();
  });
});
