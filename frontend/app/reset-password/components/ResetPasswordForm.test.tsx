import { fireEvent, render, screen } from "@testing-library/react";

import ResetPasswordForm from "@/app/reset-password/components/ResetPasswordForm";

const push = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

function fill(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe("ResetPasswordForm", () => {
  beforeEach(() => push.mockClear());

  it("shows the length hint by default", () => {
    render(<ResetPasswordForm />);
    expect(
      screen.getByText("Password must be at least 8 characters")
    ).toBeInTheDocument();
  });

  it("shows both errors and stays put when invalid", () => {
    render(<ResetPasswordForm />);
    fill(/^new password/i, "short");
    fill(/^confirm password/i, "different");
    fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));

    expect(
      screen.getByText("Password is less than 8 characters, please re-enter")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Passwords do not match, please re-enter")
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("returns to login with the success flag when valid", () => {
    render(<ResetPasswordForm />);
    fill(/^new password/i, "longenough");
    fill(/^confirm password/i, "longenough");
    fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));

    expect(push).toHaveBeenCalledWith("/login?reset=success");
  });

  it("toggles password visibility", () => {
    render(<ResetPasswordForm />);
    const input = screen.getByLabelText(/^new password/i);
    expect(input).toHaveAttribute("type", "password");

    fireEvent.click(
      screen.getAllByRole("button", { name: "Show password" })[0]
    );
    expect(input).toHaveAttribute("type", "text");
  });
});
