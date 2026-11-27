import { act, render, screen } from "@testing-library/react";

import { Toast } from "@/common/components/feedback/Toast";

describe("Toast", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("renders nothing when closed", () => {
    render(
      <Toast open={false} onOpenChange={jest.fn()}>
        Saved
      </Toast>
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("announces its message when open", () => {
    render(
      <Toast open onOpenChange={jest.fn()}>
        Password successfully reset
      </Toast>
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Password successfully reset"
    );
  });

  it("asks to close after the duration", () => {
    const onOpenChange = jest.fn();
    render(
      <Toast open onOpenChange={onOpenChange} duration={3000}>
        Saved
      </Toast>
    );

    act(() => jest.advanceTimersByTime(2999));
    expect(onOpenChange).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(1));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("stays open when duration is null", () => {
    const onOpenChange = jest.fn();
    render(
      <Toast open onOpenChange={onOpenChange} duration={null}>
        Saved
      </Toast>
    );
    act(() => jest.advanceTimersByTime(60000));
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
