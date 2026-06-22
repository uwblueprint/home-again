import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";

import DonationContactForm from "../components/DonationContactForm";
import { useCreateDonor } from "@/common/hooks/useApi";
import { useRouter } from "next/navigation";

jest.mock("@/common/hooks/useApi");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("@/common/lib/utils", () => ({
  cn: (...inputs: Array<string | undefined | null | false>) =>
    inputs.filter(Boolean).join(" "),
}));
jest.mock("@/common/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));
jest.mock("@/common/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
  InputError: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p role="alert" {...props}>
      {children}
    </p>
  ),
}));
jest.mock("@/common/components/ui/label", () => ({
  Label: ({
    children,
    ...props
  }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label {...props}>{children}</label>
  ),
}));
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt }: { alt?: string }) => (
    <span role="img" aria-label={alt ?? ""} data-testid="next-image" />
  ),
}));

const mockMutate = jest.fn();
const mockPush = jest.fn();

describe("DonationContactForm", () => {
  beforeEach(() => {
    mockMutate.mockReset();
    mockPush.mockReset();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useCreateDonor as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it("renders all form fields and submit button", () => {
    render(<DonationContactForm />);

    expect(
      screen.getByRole("heading", { name: "Welcome!" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit a donation request/i })
    ).toBeInTheDocument();
  });

  it("shows required, email, and phone validation messages", () => {
    render(<DonationContactForm />);

    fireEvent.click(
      screen.getByRole("button", { name: /submit a donation request/i })
    );

    expect(screen.getByText("First name is required.")).toBeInTheDocument();
    expect(screen.getByText("Last name is required.")).toBeInTheDocument();
    expect(screen.getByText("Email address is required.")).toBeInTheDocument();
    expect(screen.getByText("Phone number is required.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "invalid-email" },
    });
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: "abc123" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /submit a donation request/i })
    );

    expect(
      screen.getByText("Enter a valid email address.")
    ).toBeInTheDocument();
    expect(screen.getByText("Enter a valid phone number.")).toBeInTheDocument();
  });

  it("submits expected payload through useCreateDonor", () => {
    render(<DonationContactForm />);

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: "+1 (555) 123-4567" },
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
        phone: "+1 (555) 123-4567",
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

    render(<DonationContactForm />);
    const button = screen.getByRole("button", { name: /submitting/i });

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Submitting...");
  });

  it("redirects to /donate/:id on successful submit and shows error on failure", () => {
    render(<DonationContactForm />);

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: "+1 (555) 123-4567" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /submit a donation request/i })
    );

    const mutateOptions = mockMutate.mock.calls[0][1];

    act(() => {
      mutateOptions.onSuccess({ id: "donor-123" });
    });

    expect(mockPush).toHaveBeenCalledWith("/donate/donor-123");

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: "+1 (555) 123-4567" },
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
