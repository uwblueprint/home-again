import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import StepDonationSummary from "../../donation-requests/StepDonationSummary";
import {
  DonationFormProvider,
  useDonationForm,
} from "../../donation-requests/DonationFormContext";
import { useDonor } from "@/hooks/useApi";

jest.mock("@/hooks/useApi");
jest.mock("@/lib/utils", () => ({
  cn: (...inputs: Array<string | undefined | null | false>) =>
    inputs.filter(Boolean).join(" "),
}));

// jsdom does not implement URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => "blob:mock");

const mockDonor = {
  id: "donor-123",
  first_name: "Katie",
  last_name: "Sun",
  email: "katiesun@uwblueprint.org",
  phone: "(+1) 647-909-9581",
};

// Renders a button that fills the pickup address through context when clicked.
function AddressSetterButton() {
  const { setFormState } = useDonationForm();
  return (
    <button
      data-testid="set-address"
      onClick={() =>
        setFormState((prev) => ({
          ...prev,
          pickupAddress: {
            streetAddress: "210 Drake Ave",
            apartment: "",
            city: "St. John's",
            province: "NL",
            country: "CA",
            postalCode: "A2V 1K5",
          },
        }))
      }
    />
  );
}

function renderSummary() {
  return render(
    <DonationFormProvider initialDonorId="donor-123">
      <StepDonationSummary />
    </DonationFormProvider>,
  );
}

describe("StepDonationSummary", () => {
  beforeEach(() => {
    (useDonor as jest.Mock).mockReturnValue({
      data: mockDonor,
      isLoading: false,
    });
  });

  it("renders heading, subtitle, and section card titles", () => {
    renderSummary();

    expect(
      screen.getByRole("heading", { name: "Donation Summary" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/review your donation details/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Contact Information")).toBeInTheDocument();
    expect(screen.getByText("Pickup Details")).toBeInTheDocument();
    expect(screen.getByText("Donation Items")).toBeInTheDocument();
  });

  it("shows loading placeholders while donor data is loading", () => {
    (useDonor as jest.Mock).mockReturnValue({ data: undefined, isLoading: true });
    renderSummary();

    // Four fields: first name, last name, email, phone
    expect(screen.getAllByText("…")).toHaveLength(4);
  });

  it("displays donor contact information when loaded", () => {
    renderSummary();

    expect(screen.getByText("Katie")).toBeInTheDocument();
    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("katiesun@uwblueprint.org")).toBeInTheDocument();
    expect(screen.getByText("(+1) 647-909-9581")).toBeInTheDocument();
  });

  it("shows dashes for null donor fields", () => {
    (useDonor as jest.Mock).mockReturnValue({
      data: {
        id: "donor-123",
        first_name: null,
        last_name: null,
        email: null,
        phone: null,
      },
      isLoading: false,
    });
    renderSummary();

    // Four null donor fields + one item with hasStains: null → five "-" values
    expect(screen.getAllByText("-")).toHaveLength(5);
  });

  it("shows 'No address provided' when pickup address is empty", () => {
    renderSummary();

    expect(screen.getByText("No address provided")).toBeInTheDocument();
  });

  it("renders a formatted pickup address when fields are filled", () => {
    render(
      <DonationFormProvider initialDonorId="donor-123">
        <AddressSetterButton />
        <StepDonationSummary />
      </DonationFormProvider>,
    );

    fireEvent.click(screen.getByTestId("set-address"));

    expect(
      screen.getByText("210 Drake Ave, St. John's, NL, CA, A2V 1K5"),
    ).toBeInTheDocument();
  });

  it("renders a default item row with 'Unknown item' and '-' stains label", () => {
    renderSummary();

    // DonationFormProvider starts with one blank item
    expect(screen.getByText("Unknown item")).toBeInTheDocument();
    // hasStains is null → "-" (donor fields are loaded so no other "-" present)
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("smoking Yes/No toggle updates active state on click", () => {
    renderSummary();

    const [smokingYes] = screen.getAllByRole("button", { name: "Yes" });
    const [smokingNo] = screen.getAllByRole("button", { name: "No" });

    // Neither active initially
    expect(smokingYes).not.toHaveClass("bg-primary");
    expect(smokingNo).not.toHaveClass("bg-primary");

    // Select Yes
    fireEvent.click(smokingYes);
    expect(smokingYes).toHaveClass("bg-primary");
    expect(smokingNo).not.toHaveClass("bg-primary");

    // Switch to No
    fireEvent.click(smokingNo);
    expect(smokingYes).not.toHaveClass("bg-primary");
    expect(smokingNo).toHaveClass("bg-primary");
  });

  it("pets Yes/No toggle updates active state on click", () => {
    renderSummary();

    const [, petsYes] = screen.getAllByRole("button", { name: "Yes" });
    const [, petsNo] = screen.getAllByRole("button", { name: "No" });

    // Neither active initially
    expect(petsYes).not.toHaveClass("bg-primary");
    expect(petsNo).not.toHaveClass("bg-primary");

    // Select Yes
    fireEvent.click(petsYes);
    expect(petsYes).toHaveClass("bg-primary");
    expect(petsNo).not.toHaveClass("bg-primary");

    // Switch to No
    fireEvent.click(petsNo);
    expect(petsYes).not.toHaveClass("bg-primary");
    expect(petsNo).toHaveClass("bg-primary");
  });

  it("fee agreement checkbox is unchecked and shows plain asterisk initially", () => {
    renderSummary();

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
    expect(
      screen.queryByText(/agreement required to submit donation/i),
    ).not.toBeInTheDocument();
  });

  it("checks the fee agreement checkbox on click", () => {
    renderSummary();

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("unchecking the checkbox after it was checked shows the error message", () => {
    renderSummary();

    const checkbox = screen.getByRole("checkbox");

    // Check
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Uncheck — now dirty + unchecked → error message appears
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(
      screen.getByText(/agreement required to submit donation/i),
    ).toBeInTheDocument();
  });

  it("renders the fee agreement label text", () => {
    renderSummary();

    expect(
      screen.getByText(/I agree to a \$35 fee, payable at time of pickup/i),
    ).toBeInTheDocument();
  });

  it("renders the pickup address label", () => {
    renderSummary();

    expect(screen.getByText("Pickup Address")).toBeInTheDocument();
  });
});
