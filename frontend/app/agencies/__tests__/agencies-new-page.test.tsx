import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import NewAgencyPage from "../new/page";
import { useCreateAgency } from "@/hooks/useApi";
import {
  agencyFormFields,
  defaultAgencyFormValues,
} from "@/app/agencies/config/agencyFormFields";

const mockPush = jest.fn();
const mockResourceForm = jest.fn();
const mockCreateMutateAsync = jest.fn();
const mockToAgencyPayload = jest.fn();

const mockSubmittedValues = {
  name: "New Agency",
  email: "new@agency.org",
  phone: "555-0102",
  address: "456 Queen St",
  city: "Toronto",
  province: "ON",
  description: "",
  status: "approved",
  require_pre_payment: true,
  billing_profiles: "",
};

const mockTransformedPayload = {
  name: "New Agency",
  email: "new@agency.org",
  phone: "555-0102",
  address: "456 Queen St",
  city: "Toronto",
  province: "ON",
  description: null,
  status: "approved",
  require_pre_payment: true,
  billing_profiles: null,
};

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/hooks/useApi", () => ({
  useCreateAgency: jest.fn(),
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

const mockUseCreateAgency = useCreateAgency as jest.Mock;

describe("Agencies new page", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockResourceForm.mockReset();
    mockCreateMutateAsync.mockReset();
    mockToAgencyPayload.mockReset();
    mockToAgencyPayload.mockReturnValue(mockTransformedPayload);
    mockUseCreateAgency.mockReturnValue({
      mutateAsync: mockCreateMutateAsync,
      error: null,
    });
  });

  it("renders ResourceForm in create mode with agency defaults", () => {
    render(<NewAgencyPage />);

    expect(screen.getByText("Create Agency")).toBeInTheDocument();
    expect(mockResourceForm).toHaveBeenCalledTimes(1);

    const props = mockResourceForm.mock.calls[0][0];
    expect(props.mode).toBe("create");
    expect(props.fields).toBe(agencyFormFields);
    expect(props.initialValues).toBe(defaultAgencyFormValues);
  });

  it("submits transformed payload and redirects to agencies list", async () => {
    mockCreateMutateAsync.mockResolvedValue(undefined);

    render(<NewAgencyPage />);
    fireEvent.click(screen.getByTestId("mock-resource-form-submit"));

    await waitFor(() => {
      expect(mockToAgencyPayload).toHaveBeenCalledWith(mockSubmittedValues);
      expect(mockCreateMutateAsync).toHaveBeenCalledWith(mockTransformedPayload);
      expect(mockPush).toHaveBeenCalledWith("/agencies");
    });
  });

  it("shows mutation error banner", () => {
    mockUseCreateAgency.mockReturnValue({
      mutateAsync: mockCreateMutateAsync,
      error: new Error("Could not create agency"),
    });

    render(<NewAgencyPage />);

    expect(
      screen.getByText(/failed to create agency: could not create agency/i)
    ).toBeInTheDocument();
  });
});
