import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import EditAgencyPage from "../[id]/edit/page";
import { useAgency, useUpdateAgency } from "@/hooks/useApi";
import {
  agencyFormFields,
  defaultAgencyFormValues,
} from "@/app/agencies/config/agencyFormFields";
import type { Agency } from "@/types";

const mockPush = jest.fn();
const mockParams = { id: "agency-1" };
const mockResourceForm = jest.fn();
const mockUpdateMutateAsync = jest.fn();
const mockToAgencyPayload = jest.fn();

const sampleAgency: Agency = {
  id: "agency-1",
  name: "Helping Hands",
  email: "hello@hands.org",
  phone: "555-0101",
  address: "123 Main St",
  city: "Toronto",
  province: "ON",
  description: "Trusted partner",
  status: "approved",
  require_pre_payment: false,
  billing_profiles: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-02T00:00:00.000Z",
};

const mockSubmittedValues = {
  ...sampleAgency,
  name: "Helping Hands Updated",
};

const mockTransformedPayload = {
  name: "Helping Hands Updated",
  email: "hello@hands.org",
  phone: "555-0101",
  address: "123 Main St",
  city: "Toronto",
  province: "ON",
  description: "Trusted partner",
  status: "approved",
  require_pre_payment: false,
  billing_profiles: null,
};

jest.mock("next/navigation", () => ({
  useParams: () => mockParams,
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/hooks/useApi", () => ({
  useAgency: jest.fn(),
  useUpdateAgency: jest.fn(),
}));

jest.mock("@/utils/AgencyUtils", () => ({
  toAgencyPayload: (values: Record<string, unknown>) =>
    mockToAgencyPayload(values),
}));

jest.mock("@/components/forms/ResourceForm", () => ({
  ResourceForm: (props: {
    onSubmit: (values: Record<string, unknown>) => Promise<void>;
  }) => {
    mockResourceForm(props);
    return (
      <button
        data-testid="mock-resource-form-submit"
        onClick={() => void props.onSubmit(mockSubmittedValues)}
      >
        Submit Mock Form
      </button>
    );
  },
}));

const mockUseAgency = useAgency as jest.Mock;
const mockUseUpdateAgency = useUpdateAgency as jest.Mock;

describe("Agencies edit page", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockResourceForm.mockReset();
    mockUpdateMutateAsync.mockReset();
    mockToAgencyPayload.mockReset();
    mockToAgencyPayload.mockReturnValue(mockTransformedPayload);

    mockUseAgency.mockReturnValue({
      data: sampleAgency,
      isLoading: false,
      error: null,
    });
    mockUseUpdateAgency.mockReturnValue({
      mutateAsync: mockUpdateMutateAsync,
      error: null,
      isPending: false,
    });
  });

  it("shows loading state", () => {
    mockUseAgency.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<EditAgencyPage />);

    expect(screen.getByText(/loading agency/i)).toBeInTheDocument();
  });

  it("shows error state when agency fetch fails", () => {
    mockUseAgency.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Could not load"),
    });

    render(<EditAgencyPage />);

    expect(screen.getByText(/failed to load agency/i)).toBeInTheDocument();
  });

  it("passes merged initial values and edit mode to ResourceForm", () => {
    render(<EditAgencyPage />);

    expect(mockResourceForm).toHaveBeenCalledTimes(1);
    const props = mockResourceForm.mock.calls[0][0];

    expect(props.mode).toBe("edit");
    expect(props.fields).toBe(agencyFormFields);
    expect(props.initialValues).toEqual({
      ...defaultAgencyFormValues,
      ...sampleAgency,
    });
  });

  it("submits transformed payload and redirects to agencies list", async () => {
    mockUpdateMutateAsync.mockResolvedValue(undefined);

    render(<EditAgencyPage />);
    fireEvent.click(screen.getByTestId("mock-resource-form-submit"));

    await waitFor(() => {
      expect(mockToAgencyPayload).toHaveBeenCalledWith(mockSubmittedValues);
      expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
        id: "agency-1",
        agency: mockTransformedPayload,
      });
      expect(mockPush).toHaveBeenCalledWith("/agencies");
    });
  });

  it("shows mutation error banner", () => {
    mockUseUpdateAgency.mockReturnValue({
      mutateAsync: mockUpdateMutateAsync,
      error: new Error("Could not update agency"),
      isPending: false,
    });

    render(<EditAgencyPage />);

    expect(
      screen.getByText(/failed to update agency: could not update agency/i)
    ).toBeInTheDocument();
  });
});
