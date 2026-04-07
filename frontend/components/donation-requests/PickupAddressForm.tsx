"use client";

import React, { type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PickupAddress } from "@/components/donation-requests/DonationFormContext";

export type PickupAddressErrors = Partial<
  Record<
    "streetAddress" | "city" | "postalCode" | "province" | "country",
    string
  >
>;

export function validatePickupAddress(
  address: PickupAddress
): PickupAddressErrors {
  const errors: PickupAddressErrors = {};
  if (!address.streetAddress.trim()) {
    errors.streetAddress = "Street address is required.";
  }
  if (!address.city.trim()) {
    errors.city = "City is required.";
  }
  if (!address.postalCode.trim()) {
    errors.postalCode = "Postal code is required.";
  }
  if (address.province !== "NL") {
    errors.province = "Pickups are not supported in this region.";
  }
  if (address.country !== "Canada") {
    errors.country = "Pickups are not supported in this region.";
  }
  return errors;
}

interface PickupAddressFormProps {
  addressData: PickupAddress;
  onChange: (updated: PickupAddress) => void;
  errors?: PickupAddressErrors;
  onBlurField?: (
    field: "streetAddress" | "city" | "postalCode" | "province" | "country"
  ) => void;
}

const inputClass =
  "h-10 rounded-lg border-input bg-background text-[clamp(0.825rem,0.78rem+0.2vw,0.875rem)] leading-5 shadow-[0_1px_2px_0_rgba(0,0,0,0)] focus-visible:ring-0 aria-invalid:ring-0";
  
const labelClass =
  "font-medium text-foreground text-[clamp(0.825rem,0.78rem+0.2vw,0.875rem)] leading-5 aria-invalid:ring-0";

export default function PickupAddressForm({
  addressData,
  onChange,
  errors = {},
  onBlurField,
}: PickupAddressFormProps) {
  function handleChange(field: keyof PickupAddress) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      onChange({ ...addressData, [field]: e.target.value });
    };
  }

  return (
    <div className="space-y-4">
      {/* Street Address */}
      <div className="space-y-1">
        <Label htmlFor="streetAddress" className={labelClass}>
          Street Address
        </Label>
        <Input
          id="streetAddress"
          name="streetAddress"
          type="text"
          autoComplete="street-address"
          placeholder="123 Main St"
          value={addressData.streetAddress}
          onChange={handleChange("streetAddress")}
          onBlur={() => onBlurField?.("streetAddress")}
          aria-invalid={Boolean(errors.streetAddress)}
          aria-describedby={
            errors.streetAddress ? "streetAddress-error" : undefined
          }
          className={inputClass}
        />
        {errors.streetAddress ? (
          <p
            id="streetAddress-error"
            className="text-destructive text-sm"
            role="alert"
          >
            {errors.streetAddress}
          </p>
        ) : null}
      </div>

      {/* Apartment */}
      <div className="space-y-1">
        <Label htmlFor="apartment" className={labelClass}>
          Apartment, suite, etc. (optional)
        </Label>
        <Input
          id="apartment"
          name="apartment"
          type="text"
          autoComplete="address-line2"
          placeholder="Apt 4B"
          value={addressData.apartment}
          onChange={handleChange("apartment")}
          className={inputClass}
        />
      </div>

      {/* City + Province row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="city" className={labelClass}>
            City
          </Label>
          <Input
            id="city"
            name="city"
            type="text"
            autoComplete="address-level2"
            placeholder="St. John's"
            value={addressData.city}
            onChange={handleChange("city")}
            onBlur={() => onBlurField?.("city")}
            aria-invalid={Boolean(errors.city)}
            aria-describedby={errors.city ? "city-error" : undefined}
            className={inputClass}
          />
          {errors.city ? (
            <p id="city-error" className="text-destructive text-sm" role="alert">
              {errors.city}
            </p>
          ) : null}
        </div>

        <div className="space-y-1">
          <Label htmlFor="province" className={labelClass}>
            Province/territory
          </Label>
          <Input
            id="province"
            name="province"
            type="text"
            autoComplete="address-level1"
            placeholder="NL"
            value={addressData.province}
            onChange={handleChange("province")}
            onBlur={() => onBlurField?.("province")}
            aria-invalid={Boolean(errors.province)}
            aria-describedby={errors.province ? "province-error" : undefined}
            className={inputClass}
          />
          {errors.province ? (
            <p id="province-error" className="text-destructive text-sm" role="alert">
              {errors.province}
            </p>
          ) : null}
        </div>
      </div>

      {/* Country + Postal Code row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="country" className={labelClass}>
            Country
          </Label>
          <Input
            id="country"
            name="country"
            type="text"
            autoComplete="country-name"
            placeholder="Canada"
            value={addressData.country}
            onChange={handleChange("country")}
            onBlur={() => onBlurField?.("country")}
            aria-invalid={Boolean(errors.country)}
            aria-describedby={errors.country ? "country-error" : undefined}
            className={inputClass}
          />
          {errors.country ? (
            <p id="country-error" className="text-destructive text-sm" role="alert">
              {errors.country}
            </p>
          ) : null}
        </div>

        <div className="space-y-1">
          <Label htmlFor="postalCode" className={labelClass}>
            Postal code
          </Label>
          <Input
            id="postalCode"
            name="postalCode"
            type="text"
            autoComplete="postal-code"
            placeholder="A1B 2C3"
            value={addressData.postalCode}
            onChange={handleChange("postalCode")}
            onBlur={() => onBlurField?.("postalCode")}
            aria-invalid={Boolean(errors.postalCode)}
            aria-describedby={
              errors.postalCode ? "postalCode-error" : undefined
            }
            className={inputClass}
          />
          {errors.postalCode ? (
            <p
              id="postalCode-error"
              className="text-destructive text-sm"
              role="alert"
            >
              {errors.postalCode}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}