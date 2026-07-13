import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import { ToggleButtonGroup } from "./ToggleButtonGroup";

const options = [
  { value: "pending", count: 15, label: "Pending" },
  { value: "delivered", count: 8, label: "Delivered" },
];

describe("ToggleButtonGroup", () => {
  it("renders every option with its count and label", () => {
    render(
      <ToggleButtonGroup
        options={options}
        value="pending"
        onValueChange={jest.fn()}
      />
    );
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("Delivered")).toBeInTheDocument();
  });

  it("marks the selected option as pressed", () => {
    render(
      <ToggleButtonGroup
        options={options}
        value="pending"
        onValueChange={jest.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /Pending/ })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: /Delivered/ })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("calls onValueChange with the clicked option's value", () => {
    const onValueChange = jest.fn();
    render(
      <ToggleButtonGroup
        options={options}
        value="pending"
        onValueChange={onValueChange}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /Delivered/ }));
    expect(onValueChange).toHaveBeenCalledWith("delivered");
  });
});
