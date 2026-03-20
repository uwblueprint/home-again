import React from "react";
import { render, screen } from "@testing-library/react";
import AgenciesPage from "../page";
import { useAgencies } from "@/hooks/useApi";
import type { Agency } from "@/types";

jest.mock("@/hooks/useApi", () => ({
  useAgencies: jest.fn(),
}));

const mockUseAgencies = useAgencies as jest.Mock;

const sampleAgency: Agency = {
  id: "agency-1",
  name: "Helping Hands",
  email: "hello@hands.org",
  phone: "555-0101",
  address: "123 Main St",
  city: "Toronto",
  province: "ON",
  description: null,
  status: "approved",
  require_pre_payment: false,
  billing_profiles: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-02T00:00:00.000Z",
};

describe("Agencies list page", () => {
  beforeEach(() => {
    mockUseAgencies.mockReset();
  });

  it("shows loading state", () => {
    mockUseAgencies.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<AgenciesPage />);

    expect(screen.getByText(/loading agencies/i)).toBeInTheDocument();
  });

  it("shows error state", () => {
    mockUseAgencies.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed"),
    });

    render(<AgenciesPage />);

    expect(screen.getByText(/failed to load agencies/i)).toBeInTheDocument();
    expect(screen.getByText(/http:\/\/localhost:8000\/api/i)).toBeInTheDocument();
  });

  it("shows empty state when there are no agencies", () => {
    mockUseAgencies.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<AgenciesPage />);

    expect(screen.getByText(/no agencies yet/i)).toBeInTheDocument();
  });

  it("shows populated state with key links", () => {
    mockUseAgencies.mockReturnValue({
      data: [sampleAgency],
      isLoading: false,
      error: null,
    });

    render(<AgenciesPage />);

    expect(screen.getByText("Helping Hands")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /create agency/i })
    ).toHaveAttribute("href", "/agencies/new");
    expect(screen.getByRole("link", { name: /^edit$/i })).toHaveAttribute(
      "href",
      "/agencies/agency-1/edit"
    );
  });
});
