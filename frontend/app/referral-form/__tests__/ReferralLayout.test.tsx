import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("@/common/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ComponentProps<"button"> & { variant?: string }) => (
    // eslint-disable-next-line react/button-has-type
    <button {...props}>{children}</button>
  ),
}));

jest.mock(
  "tailwind-merge",
  () => ({
    twMerge: (...values: string[]) => values.join(" "),
  }),
  { virtual: true }
);

import ReferralLayout, { type BreadcrumbStep } from "../ReferralLayout";

describe("ReferralLayout", () => {
  const breadcrumbs: BreadcrumbStep[] = [
    { label: "Step 1" },
    { label: "Step 2" },
  ];

  it("renders title, breadcrumbs, children, and next button", () => {
    const onNext = jest.fn();

    render(
      <ReferralLayout title="My Step" breadcrumbs={breadcrumbs} onNext={onNext}>
        <p>Form fields</p>
      </ReferralLayout>
    );

    expect(screen.getByText("My Step")).toBeInTheDocument();
    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();
    expect(screen.getByText("Form fields")).toBeInTheDocument();
    expect(screen.getByTestId("next-button")).toBeInTheDocument();
  });

  it("calls onNext when next button is clicked", () => {
    const onNext = jest.fn();

    render(
      <ReferralLayout
        title="Next Step"
        breadcrumbs={breadcrumbs}
        onNext={onNext}
      >
        <p>Form fields</p>
      </ReferralLayout>
    );

    fireEvent.click(screen.getByTestId("next-button"));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("renders back button and triggers onBack when provided", () => {
    const onBack = jest.fn();

    render(
      <ReferralLayout
        title="With Back"
        breadcrumbs={breadcrumbs}
        onNext={jest.fn()}
        onBack={onBack}
      >
        <p>Form fields</p>
      </ReferralLayout>
    );

    const backButton = screen.getByTestId("back-button");
    expect(backButton).toBeInTheDocument();
    fireEvent.click(backButton);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("does not render back button when onBack is not provided", () => {
    render(
      <ReferralLayout
        title="No Back"
        breadcrumbs={breadcrumbs}
        onNext={jest.fn()}
      >
        <p>Form fields</p>
      </ReferralLayout>
    );

    expect(screen.queryByTestId("back-button")).toBeNull();
  });

  it("disables next button and shows loading text when submitting", () => {
    render(
      <ReferralLayout
        title="Submitting"
        breadcrumbs={breadcrumbs}
        onNext={jest.fn()}
        isSubmitting
        nextLabel="Next"
      >
        <p>Form fields</p>
      </ReferralLayout>
    );

    const nextButton = screen.getByTestId("next-button");
    expect(nextButton).toBeDisabled();
    expect(nextButton).toHaveTextContent("Loading...");
  });

  it("uses custom next button label when provided", () => {
    render(
      <ReferralLayout
        title="Custom Label"
        breadcrumbs={breadcrumbs}
        onNext={jest.fn()}
        nextLabel="Continue"
      >
        <p>Form fields</p>
      </ReferralLayout>
    );

    expect(screen.getByTestId("next-button")).toHaveTextContent("Continue");
  });
});
