import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import StepDonationSummary from "../components/StepDonationSummary";
import {
  DonationFormProvider,
  useDonationForm,
} from "../context/DonationFormContext";
import { useDonor } from "@/common/hooks/useApi";

jest.mock("@/common/hooks/useApi");
jest.mock("@/common/lib/utils", () => ({
  cn: (...inputs: Array<string | undefined | null | false>) =>
    inputs.filter(Boolean).join(" "),
}));

// jsdom does not implement URL.createObjectURL
global.URL.createObjectURL = jest.fn((file: File) => `blob:${file.name}`);
global.URL.revokeObjectURL = jest.fn();

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

// Renders a button that triggers submitAttempted through context when clicked.
function SubmitAttemptButton() {
  const { setSubmitAttempted } = useDonationForm();
  return (
    <button
      data-testid="set-submit-attempted"
      onClick={() => setSubmitAttempted(true)}
    />
  );
}

function ItemPhotosSetterButton({
  photos,
  testId,
}: {
  photos: File[];
  testId: string;
}) {
  const { setFormState } = useDonationForm();
  return (
    <button
      data-testid={testId}
      onClick={() =>
        setFormState((prev) => ({
          ...prev,
          items: prev.items.map((item, idx) =>
            idx === 0 ? { ...item, photos } : item
          ),
        }))
      }
    />
  );
}

function createFile(name: string) {
  return new File([""], name, { type: "image/png" });
}

function renderSummary() {
  return render(
    <DonationFormProvider initialDonorId="donor-123">
      <StepDonationSummary />
    </DonationFormProvider>
  );
}

describe("StepDonationSummary", () => {
  beforeEach(() => {
    (global.URL.createObjectURL as jest.Mock).mockClear();
    (global.URL.revokeObjectURL as jest.Mock).mockClear();
    (useDonor as jest.Mock).mockReturnValue({
      data: mockDonor,
      isLoading: false,
    });
  });

  it("renders heading, subtitle, and section card titles", () => {
    renderSummary();

    expect(
      screen.getByRole("heading", { name: "Donation Summary" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/review your donation details/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Contact Information")).toBeInTheDocument();
    expect(screen.getByText("Pickup Details")).toBeInTheDocument();
    expect(screen.getByText("Donation Items")).toBeInTheDocument();
  });

  it("shows loading placeholders while donor data is loading", () => {
    (useDonor as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });
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
      </DonationFormProvider>
    );

    fireEvent.click(screen.getByTestId("set-address"));

    expect(
      screen.getByText("210 Drake Ave, St. John's, NL, CA, A2V 1K5")
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
      screen.queryByText(/agreement required to submit donation/i)
    ).not.toBeInTheDocument();
  });

  it("checks the fee agreement checkbox on click", () => {
    renderSummary();

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("does not show fee error when unchecking without a submit attempt", () => {
    renderSummary();

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox); // check
    fireEvent.click(checkbox); // uncheck
    expect(checkbox).not.toBeChecked();
    expect(
      screen.queryByText(/agreement required to submit donation/i)
    ).not.toBeInTheDocument();
  });

  it("shows fee error when submit is attempted without checking the agreement", () => {
    render(
      <DonationFormProvider initialDonorId="donor-123">
        <SubmitAttemptButton />
        <StepDonationSummary />
      </DonationFormProvider>
    );

    fireEvent.click(screen.getByTestId("set-submit-attempted"));
    expect(
      screen.getByText(/agreement required to submit donation/i)
    ).toBeInTheDocument();
  });

  it("hides fee error after checking the agreement following a submit attempt", () => {
    render(
      <DonationFormProvider initialDonorId="donor-123">
        <SubmitAttemptButton />
        <StepDonationSummary />
      </DonationFormProvider>
    );

    fireEvent.click(screen.getByTestId("set-submit-attempted"));
    fireEvent.click(screen.getByRole("checkbox"));
    expect(
      screen.queryByText(/agreement required to submit donation/i)
    ).not.toBeInTheDocument();
  });

  it("shows smoking and pets errors when submit attempted without selections", () => {
    render(
      <DonationFormProvider initialDonorId="donor-123">
        <SubmitAttemptButton />
        <StepDonationSummary />
      </DonationFormProvider>
    );

    fireEvent.click(screen.getByTestId("set-submit-attempted"));
    expect(screen.getAllByText(/please select an option/i)).toHaveLength(2);
  });

  it("hides smoking error after selecting a value following a submit attempt", () => {
    render(
      <DonationFormProvider initialDonorId="donor-123">
        <SubmitAttemptButton />
        <StepDonationSummary />
      </DonationFormProvider>
    );

    fireEvent.click(screen.getByTestId("set-submit-attempted"));
    const [smokingYes] = screen.getAllByRole("button", { name: "Yes" });
    fireEvent.click(smokingYes);
    expect(screen.getAllByText(/please select an option/i)).toHaveLength(1);
  });

  it("renders the fee agreement label text", () => {
    renderSummary();

    expect(
      screen.getByText(/I agree to a \$35 fee, payable at time of pickup/i)
    ).toBeInTheDocument();
  });

  it("renders the pickup address label", () => {
    renderSummary();

    expect(screen.getByText("Pickup Address")).toBeInTheDocument();
  });

  it("releases thumbnail preview URL when item photo is cleared", () => {
    const file = createFile("summary.png");

    render(
      <DonationFormProvider initialDonorId="donor-123">
        <ItemPhotosSetterButton photos={[file]} testId="set-photos" />
        <ItemPhotosSetterButton photos={[]} testId="clear-photos" />
        <StepDonationSummary />
      </DonationFormProvider>
    );

    fireEvent.click(screen.getByTestId("set-photos"));
    fireEvent.click(screen.getByTestId("clear-photos"));

    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:summary.png");
  });
});
