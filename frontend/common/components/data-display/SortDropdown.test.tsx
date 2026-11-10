import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { SortDropdown } from "./SortDropdown";

const options = [
  { value: "recency", label: "Recency" },
  { value: "name", label: "Name" },
];

function Controlled({ onReset }: { onReset?: () => void }) {
  const [value, setValue] = useState<string | null>("recency");
  return (
    <>
      <SortDropdown
        options={options}
        value={value}
        onChange={setValue}
        onReset={() => {
          setValue(null);
          onReset?.();
        }}
      />
      <output data-testid="value">{value ?? "none"}</output>
    </>
  );
}

function openMenu() {
  fireEvent.click(screen.getByRole("button", { name: "Sort" }));
}

describe("SortDropdown", () => {
  it("keeps the menu closed until the Sort button is pressed", () => {
    render(<Controlled />);
    expect(screen.queryByText("Sort by")).toBeNull();

    openMenu();
    expect(screen.getByText("Sort by")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Recency" })).toBeChecked();
  });

  it("selects an option", () => {
    render(<Controlled />);
    openMenu();

    fireEvent.click(screen.getByText("Name"));
    expect(screen.getByTestId("value")).toHaveTextContent("name");
    expect(screen.getByRole("radio", { name: "Name" })).toBeChecked();
  });

  it("resets the selection", () => {
    const onReset = jest.fn();
    render(<Controlled onReset={onReset} />);
    openMenu();

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("value")).toHaveTextContent("none");
  });
});
