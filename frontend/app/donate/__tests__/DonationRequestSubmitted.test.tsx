import React from "react";
import { render, screen } from "@testing-library/react";
import DonationSubmitted from "@/app/donate/components/DonationSubmitted";

describe("DonationSubmitted", () => {
  it("renders heading, description, and back-to-home link", () => {
    render(<DonationSubmitted />);

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
