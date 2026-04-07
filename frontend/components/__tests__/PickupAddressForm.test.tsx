import { render, screen, fireEvent } from "@testing-library/react";
import PickupAddressForm from "@/components/donation-requests/PickupAddressForm";
import type { PickupAddress } from "@/components/donation-requests/DonationFormContext";

const DEFAULT_ADDRESS: PickupAddress = {
  streetAddress: "",
  apartment: "",
  city: "",
  province: "NL",
  country: "Canada",
  postalCode: "",
};

describe("PickupAddressForm", () => {
  it("renders all address fields", () => {
    render(
      <PickupAddressForm addressData={DEFAULT_ADDRESS} onChange={jest.fn()} />
    );

    expect(screen.getByLabelText("Street Address")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Apartment, suite, etc. (optional)")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("City")).toBeInTheDocument();
    expect(screen.getByLabelText("Province/territory")).toBeInTheDocument();
    expect(screen.getByLabelText("Country")).toBeInTheDocument();
    expect(screen.getByLabelText("Postal code")).toBeInTheDocument();
  });

  it("auto-populates Province with NL and Country with Canada", () => {
    render(
      <PickupAddressForm addressData={DEFAULT_ADDRESS} onChange={jest.fn()} />
    );

    expect(screen.getByLabelText("Province/territory")).toHaveValue("NL");
    expect(screen.getByLabelText("Country")).toHaveValue("Canada");
  });

  it("Province field is disabled and cannot be edited", () => {
    render(
      <PickupAddressForm addressData={DEFAULT_ADDRESS} onChange={jest.fn()} />
    );

    const province = screen.getByLabelText("Province/territory");
    expect(province).toBeDisabled();
    expect(province).toHaveAttribute("readonly");
    expect(province).toHaveAttribute("tabindex", "-1");

    fireEvent.change(province, { target: { value: "ON" } });
    expect(province).toHaveValue("NL");
  });

  it("Country field is disabled and cannot be edited", () => {
    render(
      <PickupAddressForm addressData={DEFAULT_ADDRESS} onChange={jest.fn()} />
    );

    const country = screen.getByLabelText("Country");
    expect(country).toBeDisabled();
    expect(country).toHaveAttribute("readonly");
    expect(country).toHaveAttribute("tabindex", "-1");

    fireEvent.change(country, { target: { value: "China" } });
    expect(country).toHaveValue("Canada");
  });

  it("calls onChange with updated address when editable fields change", () => {
    const onChange = jest.fn();
    render(
      <PickupAddressForm addressData={DEFAULT_ADDRESS} onChange={onChange} />
    );

    fireEvent.change(screen.getByLabelText("Street Address"), {
      target: { value: "42 Harbour Dr" },
    });

    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_ADDRESS,
      streetAddress: "42 Harbour Dr",
    });
  });

  it("calls onChange for city and postal code fields", () => {
    const onChange = jest.fn();
    render(
      <PickupAddressForm addressData={DEFAULT_ADDRESS} onChange={onChange} />
    );

    fireEvent.change(screen.getByLabelText("City"), {
      target: { value: "St. John's" },
    });
    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_ADDRESS,
      city: "St. John's",
    });

    fireEvent.change(screen.getByLabelText("Postal code"), {
      target: { value: "A1B 2C3" },
    });
    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_ADDRESS,
      postalCode: "A1B 2C3",
    });
  });
});
