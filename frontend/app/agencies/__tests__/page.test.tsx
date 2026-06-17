import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AgenciesPage from "../page";
import { useAgencies, useDeleteAgency } from "@/common/hooks/useApi";

jest.mock("@/common/hooks/useApi");

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const sample = [
  {
    id: "1",
    name: "Test Agency",
    phone: "123",
    address_line_1: "123 Main St",
    address_line_2: null,
    city: "Metropolis",
    postal_code: "M5V 1A1",
    main_agent_id: null,
    created_at: "",
    updated_at: "",
  },
];

describe("AgenciesPage integration", () => {
  beforeEach(() => {
    (useAgencies as jest.Mock).mockReset();
    (useDeleteAgency as jest.Mock).mockReturnValue({ mutate: jest.fn() });
    jest.spyOn(global, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders list and allows view action", () => {
    (useAgencies as jest.Mock).mockReturnValue({
      data: sample,
      isLoading: false,
      error: null,
    });

    render(<AgenciesPage />);

    expect(screen.getByText("Test Agency")).toBeInTheDocument();

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
    expect(screen.getByTestId("agencies-list")).toBeInTheDocument();
  });
});
