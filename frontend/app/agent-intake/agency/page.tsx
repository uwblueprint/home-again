"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIntakeContext } from "@/context/IntakeContext";
import {
  useIntakeFormStore,
  type AgencyFormData,
} from "@/stores/intakeFormStore";

type FormErrors = Partial<Record<keyof AgencyFormData, string>>;

const POSTAL_CODE_RE = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
const PHONE_RE = /^[\d\s()+\-]{7,20}$/;

function validate(form: AgencyFormData): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) errors.name = "Enter your agency name.";
  if (!form.addressLine1.trim()) errors.addressLine1 = "Enter a street address.";
  if (!form.city.trim()) errors.city = "Enter your city.";
  if (!form.postalCode.trim()) errors.postalCode = "Enter your postal code.";
  if (!form.phone.trim()) errors.phone = "Enter your phone number.";

  if (form.postalCode && !POSTAL_CODE_RE.test(form.postalCode.trim())) {
    errors.postalCode = "Enter a valid Canadian postal code (e.g. A1B 2C3).";
  }

  if (form.phone && !PHONE_RE.test(form.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm text-destructive mt-1">
      {message}
    </p>
  );
}

const TOUCHED_ON_SUBMIT: (keyof AgencyFormData)[] = [
  "name",
  "addressLine1",
  "city",
  "postalCode",
  "phone",
];

export default function AgencyStep() {
  const { agency, setAgency } = useIntakeFormStore();
  const { registerValidator } = useIntakeContext();

  const [form, setForm] = useState<AgencyFormData>(agency);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof AgencyFormData, boolean>>
  >({});

  // Sync local form to store on change
  useEffect(() => {
    setAgency(form);
  }, [form, setAgency]);

  // Register validator with layout — runs when Next is clicked
  useEffect(() => {
    registerValidator(() => {
      const errs = validate(form);
      setErrors(errs);
      const allTouched = TOUCHED_ON_SUBMIT.reduce(
        (acc, f) => ({ ...acc, [f]: true }),
        {} as Partial<Record<keyof AgencyFormData, boolean>>
      );
      setTouched(allTouched);
      return Object.keys(errs).length === 0;
    });
    return () => registerValidator(null);
  }, [form, registerValidator]);

  function handleChange(field: keyof AgencyFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: validate({ ...form, [field]: value })[field],
      }));
    }
  }

  function handleBlur(field: keyof AgencyFormData) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validate(form)[field] }));
  }

  const field = (id: keyof AgencyFormData) => ({
    id,
    value: form[id],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      handleChange(id, e.target.value),
    onBlur: () => handleBlur(id),
    "aria-invalid": touched[id] && !!errors[id] ? (true as const) : undefined,
  });

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-foreground mb-1">
        Partner Agency Details
      </h2>
      <p className="text-muted-foreground mb-8">
        Provide some basic information about your partner agency.
      </p>

      <div className="flex flex-col gap-6">
        {/* Agency name */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Agency name</Label>
          <Input
            {...field("name")}
            placeholder="Enter your agency name"
            className="h-11"
          />
          <FieldError message={touched.name ? errors.name : undefined} />
        </div>

        {/* Address line 1 + 2 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="addressLine1">Address line 1</Label>
            <Input
              {...field("addressLine1")}
              placeholder="Street address"
              className="h-11"
            />
            <FieldError
              message={touched.addressLine1 ? errors.addressLine1 : undefined}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="addressLine2">Address line 2</Label>
            <Input
              id="addressLine2"
              value={form.addressLine2}
              onChange={(e) => handleChange("addressLine2", e.target.value)}
              placeholder="Suite, unit, floor, or building"
              className="h-11"
            />
          </div>
        </div>

        {/* City + Province */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="city">City</Label>
            <Input
              {...field("city")}
              placeholder="Enter city"
              className="h-11"
            />
            <FieldError message={touched.city ? errors.city : undefined} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="province">Province</Label>
            <Input
              id="province"
              value={form.province}
              disabled
              readOnly
              className="h-11"
            />
          </div>
        </div>

        {/* Country + Postal code */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={form.country}
              disabled
              readOnly
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="postalCode">Postal code</Label>
            <Input
              {...field("postalCode")}
              placeholder="Enter postal code"
              className="h-11"
            />
            <FieldError
              message={touched.postalCode ? errors.postalCode : undefined}
            />
          </div>
        </div>

        {/* Phone number */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            {...field("phone")}
            type="tel"
            placeholder="Enter phone number"
            className="h-11"
          />
          <FieldError message={touched.phone ? errors.phone : undefined} />
        </div>
      </div>
    </div>
  );
}
