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

import MultiStepLayout, { type Step } from "./MultiStepLayout";

function makeSteps(): Step[] {
  return [
    {
      label: "Step One",
      substeps: [{ label: "First substep", content: <p>First content</p> }],
    },
    {
      label: "Step Two",
      substeps: [{ label: "Second substep", content: <p>Second content</p> }],
    },
  ];
}

describe("MultiStepLayout", () => {
  it("renders flow title, step labels, substep label, and content", () => {
    render(
      <MultiStepLayout
        steps={makeSteps()}
        flowTitle="My Flow"
        onSubmit={jest.fn()}
      />
    );

    expect(screen.getByText("My Flow")).toBeInTheDocument();
    expect(screen.getByText("Step One")).toBeInTheDocument();
    expect(screen.getByText("Step Two")).toBeInTheDocument();
    expect(screen.getByText("First substep")).toBeInTheDocument();
    expect(screen.getByText("First content")).toBeInTheDocument();
  });

  it("does not render a substep heading when the label is empty", () => {
    const steps: Step[] = [
      { label: "Step One", substeps: [{ label: "", content: <p>Body</p> }] },
    ];
    render(<MultiStepLayout steps={steps} onSubmit={jest.fn()} />);

    expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("does not render a back button on the first substep", () => {
    render(<MultiStepLayout steps={makeSteps()} onSubmit={jest.fn()} />);
    expect(screen.queryByTestId("back-button")).toBeNull();
  });

  it("advances internally and calls onSubmit only after the last step (uncontrolled)", () => {
    const onSubmit = jest.fn();
    render(<MultiStepLayout steps={makeSteps()} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByTestId("next-button"));
    expect(screen.getByText("Second content")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByTestId("back-button")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("next-button"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("navigates back to the previous substep", () => {
    render(<MultiStepLayout steps={makeSteps()} onSubmit={jest.fn()} />);

    fireEvent.click(screen.getByTestId("next-button"));
    expect(screen.getByText("Second content")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("back-button"));
    expect(screen.getByText("First content")).toBeInTheDocument();
  });

  it("delegates navigation to onNavigate when controlled", () => {
    const onNavigate = jest.fn();
    render(
      <MultiStepLayout
        steps={makeSteps()}
        onSubmit={jest.fn()}
        stepIndex={0}
        substepIndex={0}
        onNavigate={onNavigate}
      />
    );

    fireEvent.click(screen.getByTestId("next-button"));

    expect(onNavigate).toHaveBeenCalledWith({ stepIndex: 1, substepIndex: 0 });
    // Controlled mode: content does not change until the parent updates stepIndex.
    expect(screen.getByText("First content")).toBeInTheDocument();
  });

  it("respects an externally controlled stepIndex (e.g. jump-to-step)", () => {
    render(
      <MultiStepLayout
        steps={makeSteps()}
        onSubmit={jest.fn()}
        stepIndex={1}
        onNavigate={jest.fn()}
      />
    );

    expect(screen.getByText("Second content")).toBeInTheDocument();
  });

  it("blocks navigation when onBeforeNext returns false", () => {
    const onSubmit = jest.fn();
    const onBeforeNext = jest.fn().mockReturnValue(false);
    render(
      <MultiStepLayout
        steps={makeSteps()}
        onSubmit={onSubmit}
        onBeforeNext={onBeforeNext}
      />
    );

    fireEvent.click(screen.getByTestId("next-button"));

    expect(onBeforeNext).toHaveBeenCalledTimes(1);
    expect(screen.getByText("First content")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disables next button and shows loading text when submitting", () => {
    render(
      <MultiStepLayout steps={makeSteps()} onSubmit={jest.fn()} isSubmitting />
    );

    const nextButton = screen.getByTestId("next-button");
    expect(nextButton).toBeDisabled();
    expect(nextButton).toHaveTextContent("Loading...");
  });

  it("uses the custom submit label only on the final step", () => {
    render(
      <MultiStepLayout
        steps={makeSteps()}
        onSubmit={jest.fn()}
        submitLabel="Finish"
      />
    );

    expect(screen.getByTestId("next-button")).toHaveTextContent("Next");
    fireEvent.click(screen.getByTestId("next-button"));
    expect(screen.getByTestId("next-button")).toHaveTextContent("Finish");
  });

  it("applies layout-level classes to the active step content container", () => {
    render(
      <MultiStepLayout
        steps={makeSteps()}
        onSubmit={jest.fn()}
        contentClassName="w-[90vw] px-md"
      />
    );

    expect(screen.getByTestId("multi-step-content")).toHaveClass(
      "w-[90vw]",
      "px-md"
    );
  });
});
