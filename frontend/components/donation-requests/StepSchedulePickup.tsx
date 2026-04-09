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
  ;
  
export default function StepSchedulePickup() {
  const { formState, setFormState } = useDonationForm();
  const [touched, setTouched] = useState<Record<TouchableField, boolean>>({
    streetAddress: false,
    city: false,
    postalCode: false,
  });

  const allErrors = validatePickupAddress(formState.pickupAddress);
  const showAll = formState.pickupSubmitAttempted;

  const visibleErrors = {
    streetAddress:
      touched.streetAddress || showAll ? allErrors.streetAddress : undefined,
    city: touched.city || showAll ? allErrors.city : undefined,
    postalCode:
      touched.postalCode || showAll ? allErrors.postalCode : undefined,
  };

  const hasAnyVisibleError =
    Boolean(visibleErrors.streetAddress) ||
    Boolean(visibleErrors.city) ||
    Boolean(visibleErrors.postalCode);

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

      <div
        className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-muted-foreground"
        role="note"
      >
        <span aria-hidden="true" className="text-muted-foreground">ⓘ</span>
        <span>
          Home Again Furniture Bank is currently only servicing Newfoundland
          and Labrador, Canada.
        </span>
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