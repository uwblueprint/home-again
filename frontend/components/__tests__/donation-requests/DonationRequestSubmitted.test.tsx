import React from "react";
import { render, screen } from "@testing-library/react";
import DonationRequestSubmitted from "@/components/donation-requests/DonationRequestSubmitted";

describe("DonationRequestSubmitted", () => {
  it("renders heading, description, and back-to-home link", () => {
    render(<DonationRequestSubmitted />);

    expect(
      screen.getByRole("heading", { name: "Donation Request Submitted!" })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /you'll receive an email shortly confirming your submission/i
      )
    ).toBeInTheDocument();

    const backToHome = screen.getByRole("button", { name: "Back to Home" });
    expect(backToHome).toBeInTheDocument();
    expect(backToHome).toHaveAttribute("href", "/");
  });
});
