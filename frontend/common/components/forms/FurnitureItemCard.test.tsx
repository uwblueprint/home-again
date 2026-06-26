import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import FurnitureItemCard from "./FurnitureItemCard";

function renderCard(
  props: Partial<React.ComponentProps<typeof FurnitureItemCard>> = {}
) {
  const defaultProps: React.ComponentProps<typeof FurnitureItemCard> = {
    label: "Sofa",
    selected: false,
    quantity: 1,
    notes: "",
    onToggle: jest.fn(),
    onQuantityChange: jest.fn(),
    onNotesChange: jest.fn(),
    ...props,
  };

  return {
    ...render(<FurnitureItemCard {...defaultProps} />),
    props: defaultProps,
  };
}

describe("FurnitureItemCard", () => {
  it("does not render quantity controls when the item is not selected", () => {
    renderCard();

    expect(
      screen.queryByRole("button", { name: "Decrease value" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Increase value" })
    ).not.toBeInTheDocument();
  });

  it("renders quantity controls when the item is selected", () => {
    renderCard({ selected: true, quantity: 2 });

    expect(
      screen.getByRole("button", { name: "Decrease value" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Increase value" })
    ).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("calls onToggle when the checkbox changes", () => {
    const onToggle = jest.fn();
    renderCard({ onToggle });

    fireEvent.click(screen.getByLabelText("Select Sofa"));

    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it("calls onQuantityChange when the selected item quantity changes", () => {
    const onQuantityChange = jest.fn();
    renderCard({
      selected: true,
      quantity: 1,
      onQuantityChange,
    });

    fireEvent.click(screen.getByRole("button", { name: "Increase value" }));

    expect(onQuantityChange).toHaveBeenCalledWith(2);
  });

  it("updates notes through onNotesChange when selected", () => {
    const onNotesChange = jest.fn();
    renderCard({ selected: true, onNotesChange });

    fireEvent.change(
      screen.getByPlaceholderText("Add item details or specifications"),
      { target: { value: "Blue fabric" } }
    );

    expect(onNotesChange).toHaveBeenCalledWith("Blue fabric");
  });

  it("only renders the size edit button when selected sizes are collapsed", () => {
    const subOptions = [
      { id: "twin", label: "Twin", quantity: 1 },
      { id: "queen", label: "Queen", quantity: 0 },
    ];
    const { rerender, props } = renderCard({
      label: "Mattress",
      selected: false,
      quantity: 0,
      subOptions,
      onSubQuantityChange: jest.fn(),
    });

    expect(
      screen.queryByRole("button", { name: "Edit sizes" })
    ).not.toBeInTheDocument();

    rerender(
      <FurnitureItemCard
        {...props}
        label="Mattress"
        selected
        subOptions={subOptions}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    expect(
      screen.getByRole("button", { name: "Edit sizes" })
    ).toBeInTheDocument();
  });
});
