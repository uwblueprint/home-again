"use client";

import React, { useEffect, useState } from "react";

import IntakeStepPage from "@/app/agent-intake/components/IntakeStepPage";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { useIntakeContext } from "@/app/agent-intake/context/IntakeContext";
import {
  useIntakeFormStore,
  type AgencyFormData,
} from "@/app/agent-intake/stores/intakeFormStore";

import { PHONE_REGEX, POSTAL_CODE_REGEX } from "@/common/constants/validators";

type FormErrors = Partial<Record<keyof AgencyFormData, string>>;

const POSTAL_CODE_RE = POSTAL_CODE_REGEX;
const PHONE_RE = PHONE_REGEX;

function validate(form: AgencyFormData): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) errors.name = "Enter your agency name.";
  if (!form.addressLine1.trim())
    errors.addressLine1 = "Enter a street address.";
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
    <p role="alert" className="mt-1 text-sm text-destructive">
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

  useEffect(() => {
    setAgency(form);
  }, [form, setAgency]);

  useEffect(() => {
    registerValidator(() => {
      const nextErrors = validate(form);
      setErrors(nextErrors);
      const allTouched = TOUCHED_ON_SUBMIT.reduce(
        (acc, field) => ({ ...acc, [field]: true }),
        {} as Partial<Record<keyof AgencyFormData, boolean>>
      );
      setTouched(allTouched);
      return Object.keys(nextErrors).length === 0;
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
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      handleChange(id, event.target.value),
    onBlur: () => handleBlur(id),
    "aria-invalid": touched[id] && !!errors[id] ? (true as const) : undefined,
  });

  return (
    <IntakeStepPage
      title="Partner Agency Details"
      description="Provide some basic information about your partner agency."
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Agency name</Label>
          <Input
            {...field("name")}
            placeholder="Enter your agency name"
            className="h-11 border-border bg-background"
          />
          <FieldError message={touched.name ? errors.name : undefined} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="addressLine1">Address line 1</Label>
            <Input
              {...field("addressLine1")}
              placeholder="Street address"
              className="h-11 border-border bg-background"
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
              onChange={(event) =>
                handleChange("addressLine2", event.target.value)
              }
              placeholder="Suite, unit, floor, or building"
              className="h-11 border-border bg-background"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="city">City</Label>
            <Input
              {...field("city")}
              placeholder="Enter city"
              className="h-11 border-border bg-background"
            />
            <FieldError message={touched.city ? errors.city : undefined} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="province">Province</Label>
            <Select
              value={form.province}
              onValueChange={(value) =>
                value && handleChange("province", value)
              }
            >
              <SelectTrigger id="province" className="!h-11 w-full py-0">
                <SelectValue placeholder="Select a province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Newfoundland and Labrador">
                  Newfoundland and Labrador
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="-mt-2 text-sm text-muted-foreground">
          Home Again currently only services Newfoundland and Labrador, Canada.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="country">Country</Label>
            <Select
              value={form.country}
              onValueChange={(value) => value && handleChange("country", value)}
            >
              <SelectTrigger id="country" className="!h-11 w-full py-0">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Canada">Canada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="postalCode">Postal code</Label>
            <Input
              {...field("postalCode")}
              placeholder="Enter postal code"
              className="h-11 border-border bg-background"
            />
            <FieldError
              message={touched.postalCode ? errors.postalCode : undefined}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            {...field("phone")}
            type="tel"
            placeholder="Enter phone number"
            className="h-11 border-border bg-background"
          />
          <FieldError message={touched.phone ? errors.phone : undefined} />
        </div>
      </div>
    </IntakeStepPage>
  );
}
