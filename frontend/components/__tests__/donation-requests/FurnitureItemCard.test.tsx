import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import FurnitureItemCard from "../../donation-requests/FurnitureItemCard";
import type { FurnitureItemData } from "../../donation-requests/DonationFormContext";

// Helpers

function createMockItem(
  overrides: Partial<FurnitureItemData> = {},
): FurnitureItemData {
  return {
    id: "item-1",
    furnitureType: null,
    hasStains: null,
    photos: [],
    ...overrides,
  };
}

function renderCard(props: Partial<React.ComponentProps<typeof FurnitureItemCard>> = {}) {
  const defaultProps: React.ComponentProps<typeof FurnitureItemCard> = {
    itemData: createMockItem(),
    index: 0,
    isExpanded: true,
    onToggle: jest.fn(),
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
    isDeleteDisabled: false,
    ...props,
  };
  return { ...render(<FurnitureItemCard {...defaultProps} />), props: defaultProps };
}

// Tests

describe("FurnitureItemCard", () => {
  describe("expand / collapse", () => {
    it("shows item details when expanded", () => {
      renderCard({ isExpanded: true });
      expect(screen.getByText("Item Details")).toBeInTheDocument();
      expect(screen.getByText("Select Furniture Type")).toBeInTheDocument();
    });

    it("sets aria-expanded false on header when collapsed", () => {
      renderCard({ isExpanded: false });
      expect(screen.getByRole("button", { expanded: false })).toBeInTheDocument();
    });

    it("calls onToggle when header is clicked", () => {
      const onToggle = jest.fn();
      renderCard({ onToggle });
      fireEvent.click(screen.getByRole("button", { expanded: true }));
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("displays item number and furniture type in header", () => {
      renderCard({
        index: 2,
        itemData: createMockItem({ furnitureType: "Dresser" }),
      });
      expect(screen.getByText("Item 3 - Dresser")).toBeInTheDocument();
    });

    it("displays only item number when no type selected", () => {
      renderCard({ index: 0 });
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });
  });

  describe("furniture type selection", () => {
    it("renders all 14 furniture type options", () => {
      renderCard();
      const radios = screen.getAllByRole("radio");
      expect(radios).toHaveLength(14);
    });

    it("calls onUpdate with selected furniture type", () => {
      const onUpdate = jest.fn();
      renderCard({ onUpdate });

      fireEvent.click(screen.getByLabelText("Sofa"));
      expect(onUpdate).toHaveBeenCalledWith({ furnitureType: "Sofa" });
    });

    it("shows the correct radio as checked when type is set", () => {
      renderCard({
        itemData: createMockItem({ furnitureType: "Desk" }),
      });

      const deskRadio = screen.getByLabelText("Desk") as HTMLInputElement;
      expect(deskRadio.checked).toBe(true);
    });
  });

  describe("stains toggle", () => {
    it("calls onUpdate with hasStains true when Yes is clicked", () => {
      const onUpdate = jest.fn();
      renderCard({ onUpdate });

      fireEvent.click(screen.getByRole("button", { name: "Yes" }));
      expect(onUpdate).toHaveBeenCalledWith({ hasStains: true });
    });

    it("calls onUpdate with hasStains false when No is clicked", () => {
      const onUpdate = jest.fn();
      renderCard({ onUpdate });

      fireEvent.click(screen.getByRole("button", { name: "No" }));
      expect(onUpdate).toHaveBeenCalledWith({ hasStains: false });
    });
  });

  describe("delete logic", () => {
    it("calls onDelete when delete button is clicked", () => {
      const onDelete = jest.fn();
      renderCard({ onDelete, isDeleteDisabled: false });

      fireEvent.click(screen.getByLabelText("Delete item 1"));
      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it("disables delete button when isDeleteDisabled is true", () => {
      renderCard({ isDeleteDisabled: true });

      const deleteBtn = screen.getByLabelText("Delete item 1");
      expect(deleteBtn).toBeDisabled();
    });

    it("enables delete button when isDeleteDisabled is false", () => {
      renderCard({ isDeleteDisabled: false });

      const deleteBtn = screen.getByLabelText("Delete item 1");
      expect(deleteBtn).not.toBeDisabled();
    });
  });

  describe("photo upload", () => {
    it("renders upload button", () => {
      renderCard();
      expect(
        screen.getByRole("button", { name: /upload photos/i }),
      ).toBeInTheDocument();
    });
  });
});
