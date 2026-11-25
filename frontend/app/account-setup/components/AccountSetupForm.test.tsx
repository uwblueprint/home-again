import { fireEvent, render, screen } from "@testing-library/react";

import AccountSetupForm from "@/app/account-setup/components/AccountSetupForm";

const push = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

function fill(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: "Create account" }));
}

describe("AccountSetupForm", () => {
  beforeEach(() => push.mockClear());

  it("shows the inviting agency and a locked invite email", () => {
    render(<AccountSetupForm email="sam@agency.ca" agencyName="Test Agency" />);
    expect(screen.getByText(/Test Agency has invited you/)).toBeInTheDocument();
    const email = screen.getByLabelText(/^email/i);
    expect(email).toHaveValue("sam@agency.ca");
    expect(email).toBeDisabled();
  });

  it("flags every missing field on submit", () => {
    render(<AccountSetupForm />);
    submit();

    expect(screen.getByText("Enter a first name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a last name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a phone number.")).toBeInTheDocument();
    expect(
      screen.getByText("Password is less than 8 characters, please re-enter")
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("rejects an invalid phone number", () => {
    render(<AccountSetupForm />);
    fill(/^phone number/i, "abc");
    fireEvent.blur(screen.getByLabelText(/^phone number/i));
    expect(screen.getByText("Enter a valid phone number.")).toBeInTheDocument();
  });

  it("clears a field's error as the user types", () => {
    render(<AccountSetupForm />);
    submit();
    fill(/^first name/i, "S");
    expect(screen.queryByText("Enter a first name.")).not.toBeInTheDocument();
  });

  it("goes to login when everything is valid", () => {
    render(<AccountSetupForm />);
    fill(/^first name/i, "Sam");
    fill(/^last name/i, "Walsh");
    fill(/^phone number/i, "709-555-0123");
    fill(/^password/i, "longenough");
    fill(/^confirm password/i, "longenough");
    submit();

    expect(push).toHaveBeenCalledWith("/login");
  });
});
