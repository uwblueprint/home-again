import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { SortMenu, type SortDirection } from "./sort-menu";

const options = [
  { value: "recency", label: "Recency" },
  { value: "name", label: "Name" },
];

describe("SortMenu", () => {
  it("selects an option and resets", () => {
    const onChange = jest.fn();
    const onReset = jest.fn();
    render(
      <SortMenu
        options={options}
        value="recency"
        onChange={onChange}
        onReset={onReset}
      />
    );

    expect(screen.getByText("Sort by")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Recency" })).toBeChecked();

    fireEvent.click(screen.getByText("Name"));
    expect(onChange).toHaveBeenCalledWith("name");

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("hides the direction arrows unless both direction props are passed", () => {
    const { rerender } = render(
      <SortMenu options={options} value="recency" onChange={jest.fn()} />
    );
    expect(screen.queryByRole("group", { name: "Sort direction" })).toBeNull();

    // A direction with no handler would render arrows that do nothing.
    rerender(
      <SortMenu
        options={options}
        value="recency"
        onChange={jest.fn()}
        direction="asc"
      />
    );
    expect(screen.queryByRole("group", { name: "Sort direction" })).toBeNull();
  });

  it("reflects the current direction with aria-pressed", () => {
    render(
      <SortMenu
        options={options}
        value="recency"
        onChange={jest.fn()}
        direction="desc"
        onDirectionChange={jest.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Descending" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Ascending" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("changes direction when the other arrow is pressed", () => {
    function Controlled() {
      const [direction, setDirection] = useState<SortDirection>("desc");
      return (
        <SortMenu
          options={options}
          value="recency"
          onChange={jest.fn()}
          direction={direction}
          onDirectionChange={setDirection}
        />
      );
    }
    render(<Controlled />);

    const ascending = screen.getByRole("button", { name: "Ascending" });
    fireEvent.click(ascending);
    expect(ascending).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Descending" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("keeps the direction when the active arrow is pressed again", () => {
    const onDirectionChange = jest.fn();
    render(
      <SortMenu
        options={options}
        value="recency"
        onChange={jest.fn()}
        direction="asc"
        onDirectionChange={onDirectionChange}
      />
    );

    const ascending = screen.getByRole("button", { name: "Ascending" });
    fireEvent.click(ascending);
    expect(onDirectionChange).not.toHaveBeenCalled();
    expect(ascending).toHaveAttribute("aria-pressed", "true");
  });

  it("still shows the arrows when the heading is hidden", () => {
    render(
      <SortMenu
        options={options}
        value="recency"
        onChange={jest.fn()}
        label=""
        direction="asc"
        onDirectionChange={jest.fn()}
      />
    );
    expect(screen.queryByText("Sort by")).toBeNull();
    expect(
      screen.getByRole("group", { name: "Sort direction" })
    ).toBeInTheDocument();
  });
});
