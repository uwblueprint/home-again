import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  Card,
  CardCollapseHeader,
  CardHeading,
  CardFooter,
  CardCollapsibleContent,
} from "./Card";

jest.mock("@/common/lib/utils", () => ({
  cn: (...inputs: (string | undefined | null | false)[]) =>
    inputs.filter(Boolean).join(" "),
}));

describe("Card", () => {
  it("renders its children", () => {
    render(
      <Card>
        <span>card body</span>
      </Card>
    );
    expect(screen.getByText("card body")).toBeInTheDocument();
  });

  it("uses gap-lg by default", () => {
    render(<Card data-testid="card" />);
    const card = screen.getByTestId("card");
    expect(card.className).toContain("gap-lg");
    expect(card.className).not.toContain("gap-0");
  });

  it("emits a single gap-0 (and no gap-lg) when gap='none'", () => {
    // gap is selected via prop rather than a className override because
    // tailwind-merge cannot dedupe the project's named spacing tokens.
    render(<Card gap="none" data-testid="card" />);
    const card = screen.getByTestId("card");
    expect(card.className).toContain("gap-0");
    expect(card.className).not.toContain("gap-lg");
  });
});

describe("CardCollapseHeader", () => {
  it("renders the title and badge", () => {
    render(<CardCollapseHeader title="Item 1" badge={<span>Badge</span>} />);
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Badge")).toBeInTheDocument();
  });

  it("is a static element with no button when onToggle is omitted", () => {
    render(<CardCollapseHeader title="Title 1" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders an interactive toggle button when onToggle is provided", () => {
    const onToggle = jest.fn();
    render(<CardCollapseHeader title="Item 1" open onToggle={onToggle} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("reflects the collapsed state via aria-expanded", () => {
    render(<CardCollapseHeader title="Item 1" open={false} onToggle={jest.fn()} />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("hides the trailing icon when showIcon is false", () => {
    const { container } = render(
      <CardCollapseHeader title="Title 1" showIcon={false} />
    );
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });
});

describe("CardHeading", () => {
  it("renders the heading and an action slot", () => {
    render(
      <CardHeading action={<button>Edit</button>}>Client Information</CardHeading>
    );
    expect(
      screen.getByRole("heading", { name: "Client Information" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });
});

describe("CardFooter", () => {
  it("renders its action children", () => {
    render(
      <CardFooter>
        <button>Cancel</button>
        <button>Save</button>
      </CardFooter>
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });
});

describe("CardCollapsibleContent", () => {
  it("exposes its open state via data-state", () => {
    const { rerender } = render(
      <CardCollapsibleContent open>
        <span>body</span>
      </CardCollapsibleContent>
    );
    expect(screen.getByText("body")).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="card-collapsible-content"]')
    ).toHaveAttribute("data-state", "open");

    rerender(
      <CardCollapsibleContent open={false}>
        <span>body</span>
      </CardCollapsibleContent>
    );
    expect(
      document.querySelector('[data-slot="card-collapsible-content"]')
    ).toHaveAttribute("data-state", "closed");
  });
});
