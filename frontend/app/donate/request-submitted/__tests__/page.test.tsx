import React from "react";
import { render, screen } from "@testing-library/react";
import DonationRequestSubmittedPage from "../page";

describe("DonationRequestSubmittedPage", () => {
  it("renders heading, description, and back-to-home link", () => {
    render(<DonationRequestSubmittedPage />);

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
