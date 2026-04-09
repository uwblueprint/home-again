"use client";

import React, { useState } from "react";
import {
  useDonationForm,
  type PickupAddress,
} from "@/components/donation-requests/DonationFormContext";
import PickupAddressForm, {
  validatePickupAddress,
} from "@/components/donation-requests/PickupAddressForm";

type TouchableField =
  | "streetAddress"
  | "city"
  | "postalCode"
  | "province"
  | "country";
  
export default function StepSchedulePickup() {
  const { formState, setFormState } = useDonationForm();
  const [touched, setTouched] = useState<Record<TouchableField, boolean>>({
    streetAddress: false,
    city: false,
    postalCode: false,
    province: false,
    country: false,
  });

  const allErrors = validatePickupAddress(formState.pickupAddress);
  const showAll = formState.pickupSubmitAttempted;

  const visibleErrors = {
    streetAddress:
      touched.streetAddress || showAll ? allErrors.streetAddress : undefined,
    city: touched.city || showAll ? allErrors.city : undefined,
    postalCode:
      touched.postalCode || showAll ? allErrors.postalCode : undefined,
    province: touched.province || showAll ? allErrors.province : undefined,
    country: touched.country || showAll ? allErrors.country : undefined,
  };

  const hasAnyVisibleError =
    Boolean(visibleErrors.streetAddress) ||
    Boolean(visibleErrors.city) ||
    Boolean(visibleErrors.postalCode) ||
    Boolean(visibleErrors.province) ||
    Boolean(visibleErrors.country);

  function handleAddressChange(updated: PickupAddress) {
    setFormState((prev) => ({ ...prev, pickupAddress: updated }));
  }

  function handleBlurField(field: TouchableField) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground">Schedule a Pickup</h2>
        <p className="text-sm text-muted-foreground">
          Enter the address where you&apos;d like your donation picked up.
        </p>
      </div>

      {showAll && hasAnyVisibleError ? (
        <p className="text-destructive text-sm" role="alert">
          Please fill in all required fields before continuing.
        </p>
      ) : null}

      <PickupAddressForm
        addressData={formState.pickupAddress}
        onChange={handleAddressChange}
        errors={visibleErrors}
        onBlurField={handleBlurField}
      />
    </div>
  );
}