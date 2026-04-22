import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmModal from "@/common/components/feedback/ConfirmModal";

describe("ConfirmModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <ConfirmModal
        isOpen={false}
        title="Delete item"
        message="Are you sure?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders title and message when open", () => {
    render(
      <ConfirmModal
        isOpen
        title="Delete item"
        message="Are you sure?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Delete item")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("calls onCancel when clicking the backdrop", async () => {
    const onCancel = jest.fn();

    render(
      <ConfirmModal
        isOpen
        title="Delete item"
        message="Are you sure?"
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByRole("dialog"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("does not call onCancel when clicking inside the dialog body", async () => {
    const onCancel = jest.fn();

    render(
      <ConfirmModal
        isOpen
        title="Delete item"
        message="Are you sure?"
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByText("Are you sure?"));
    expect(onCancel).not.toHaveBeenCalled();
  });
});
