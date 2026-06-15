"use client";

import React, { useState } from "react";
import {
  useDonationForm,
  type PickupAddress,
} from "@/app/donate/context/DonationFormContext";
import PickupAddressForm, {
  validatePickupAddress,
} from "@/app/donate/components/PickupAddressForm";
import { InputError } from "@/common/components/ui/input";

type TouchableField = "streetAddress" | "city" | "postalCode";

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
        <h2 className="text-3xl font-semibold text-foreground">
          Schedule a Pickup
        </h2>
        <p className="text-lg text-muted-foreground">
          Enter the address where you&apos;d like your donation picked up.
        </p>
      </div>

      <div
        className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-3 text-sm"
        role="note"
      >
        <span aria-hidden="true" className="text-muted-foreground">
          ⓘ
        </span>
        <span className="font-medium">
          Home Again Furniture Bank is currently only servicing Newfoundland and
          Labrador, Canada.
        </span>
      </div>

      {showAll && hasAnyVisibleError ? (
        <InputError>
          Please fill in all required fields before continuing.
        </InputError>
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
