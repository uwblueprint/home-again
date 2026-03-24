import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";

import DonationRequestContactForm from "../DonationRequestContactForm";
import { useCreateDonor } from "@/hooks/useApi";

jest.mock("@/hooks/useApi");
jest.mock("@/lib/utils", () => ({
  cn: (...inputs: Array<string | undefined | null | false>) =>
    inputs.filter(Boolean).join(" "),
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));
jest.mock("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}));
jest.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label {...props}>{children}</label>
  ),
}));
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    priority: _priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) =>
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt ?? ""} />,
}));

const mockMutate = jest.fn();

describe("DonationRequestContactForm", () => {
  beforeEach(() => {
    mockMutate.mockReset();
    (useCreateDonor as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it("renders all form fields and submit button", () => {
    render(<DonationRequestContactForm />);

    expect(screen.getByRole("heading", { name: "Welcome!" })).toBeInTheDocument();
    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone Number")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit a donation request/i })
    ).toBeInTheDocument();
  });

  it("shows required and email validation messages", () => {
    render(<DonationRequestContactForm />);

    fireEvent.click(
      screen.getByRole("button", { name: /submit a donation request/i })
    );

    expect(screen.getByText("First name is required.")).toBeInTheDocument();
    expect(screen.getByText("Last name is required.")).toBeInTheDocument();
    expect(screen.getByText("Email address is required.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByLabelText("Last Name"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "invalid-email" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /submit a donation request/i })
    );

    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
  });

  it("submits expected payload through useCreateDonor", () => {
    render(<DonationRequestContactForm />);

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByLabelText("Last Name"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Phone Number"), {
      target: { value: "+1 555 1234" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /submit a donation request/i })
    );

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith(
      {
        first_name: "Jane",
        last_name: "Doe",
        email: "jane@example.com",
        phone: "+1 555 1234",
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );
  });

  it("disables submit button and shows pending text while submitting", () => {
    (useCreateDonor as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    });

    render(<DonationRequestContactForm />);
    const button = screen.getByRole("button", { name: /submitting/i });

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Submitting...");
  });

  it("shows success and error announcement messages", () => {
    render(<DonationRequestContactForm />);

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByLabelText("Last Name"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "jane@example.com" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /submit a donation request/i })
    );

    const mutateOptions = mockMutate.mock.calls[0][1];

    act(() => {
      mutateOptions.onSuccess();
    });

    expect(
      screen.getByText("Thanks. Your contact information has been submitted.")
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByLabelText("Last Name"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "jane@example.com" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /submit a donation request/i })
    );

    const secondMutateOptions = mockMutate.mock.calls[1][1];

    act(() => {
      secondMutateOptions.onError();
    });

    expect(
      screen.getByText("We could not submit your request. Please try again.")
    ).toBeInTheDocument();
  });
});
