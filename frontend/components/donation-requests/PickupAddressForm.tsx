"use client";

import React, { type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PickupAddress } from "@/components/donation-requests/DonationFormContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type PickupAddressErrors = Partial<
  Record<
    "streetAddress" | "city" | "postalCode",
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
  return errors;
}

interface PickupAddressFormProps {
  addressData: PickupAddress;
  onChange: (updated: PickupAddress) => void;
  errors?: PickupAddressErrors;
  onBlurField?: (
    field: "streetAddress" | "city" | "postalCode"
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
            placeholder="Enter city"
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
          <Select
            value={addressData.province}
            onValueChange={(value) =>
              onChange({ ...addressData, province: value ?? "Newfoundland and Labrador" })
            }
          >
            <SelectTrigger id="province" className={`${inputClass} w-full !h-10`}>
              <SelectValue placeholder="Newfoundland and Labrador" />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectItem value="Newfoundland and Labrador">
                Newfoundland and Labrador
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Country + Postal Code row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="country" className={labelClass}>
            Country
          </Label>
          <Select
            value={addressData.country}
            onValueChange={(value) =>
              onChange({ ...addressData, country: value ?? "Canada" })
            }
          >
            <SelectTrigger id="country" className={`${inputClass} w-full !h-10`}>
              <SelectValue placeholder="Canada" />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectItem value="Canada">Canada</SelectItem>
            </SelectContent>
          </Select>
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
            placeholder="Enter postal code"
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