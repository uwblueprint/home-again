import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DonationFormProvider, useDonationForm } from "../../donation-requests/DonationFormContext";
import StepFurnitureDetails from "../../donation-requests/StepFurnitureDetails";

// Helpers

function renderWithProvider() {
  return render(
    <DonationFormProvider initialDonorId="test-donor-id">
      <StepFurnitureDetails />
    </DonationFormProvider>,
  );
}

// Need a wrapper that exposes the addItem function via a test button.
function TestHarness() {
  return (
    <DonationFormProvider initialDonorId="test-donor-id">
      <StepFurnitureDetailsWithAddButton />
    </DonationFormProvider>
  );
}

function StepFurnitureDetailsWithAddButton() {
  const { addItem } = useDonationForm();
  return (
    <>
      <button data-testid="add-item-btn" onClick={addItem}>
        Add
      </button>
      <StepFurnitureDetails />
    </>
  );
}

// Tests

describe("StepFurnitureDetails", () => {
  it("renders page heading and one default item card", () => {
    renderWithProvider();

    expect(screen.getByText("What Are You Donating?")).toBeInTheDocument();
    expect(screen.getByTestId("furniture-item-card-0")).toBeInTheDocument();
    // First item is expanded by default
    expect(screen.getByText("Item Details")).toBeInTheDocument();
  });

  it("auto-collapses previous item when a new item is added", () => {
    render(<TestHarness />);

    // Initially one expanded card
    expect(screen.getByRole("button", { expanded: true })).toBeInTheDocument();

    // Add a second item
    act(() => {
      fireEvent.click(screen.getByTestId("add-item-btn"));
    });

    // Should now have two cards
    expect(screen.getByTestId("furniture-item-card-0")).toBeInTheDocument();
    expect(screen.getByTestId("furniture-item-card-1")).toBeInTheDocument();

    // The accordion uses CSS-only animation so both "Item Details" headings stay in the DOM.
    // Verify collapse state via aria-expanded: only the newest card should be expanded.
    expect(screen.getAllByRole("button", { expanded: true })).toHaveLength(1);
    expect(screen.getAllByRole("button", { expanded: false })).toHaveLength(1);
  });

  it("disables delete when only one item exists", () => {
    renderWithProvider();

    const deleteBtn = screen.getByLabelText("Delete item 1");
    expect(deleteBtn).toBeDisabled();
  });

  it("enables delete when multiple items exist", () => {
    render(<TestHarness />);

    act(() => {
      fireEvent.click(screen.getByTestId("add-item-btn"));
    });

    // Both delete buttons should now be enabled
    const deleteButtons = screen.getAllByLabelText(/Delete item/);
    deleteButtons.forEach((btn) => {
      expect(btn).not.toBeDisabled();
    });
  });
});
