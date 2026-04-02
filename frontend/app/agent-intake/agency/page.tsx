"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIntakeContext } from "@/context/IntakeContext";
import { useIntakeStore, type AgencyFormData } from "@/stores/intakeStore";

// Canadian provinces and territories
const PROVINCES = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland & Labrador",
  "Northwest Territories",
  "Nova Scotia",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Yukon",
];

type FormErrors = Partial<Record<keyof AgencyFormData, string>>;

const REQUIRED_FIELDS: (keyof AgencyFormData)[] = [
  "name",
  "address_line_1",
  "city",
  "province",
  "country",
  "postal_code",
  "phone",
];

const POSTAL_CODE_RE = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
const PHONE_RE = /^[\d\s()+\-]{7,20}$/;

function validate(form: AgencyFormData): FormErrors {
  const errors: FormErrors = {};

  for (const field of REQUIRED_FIELDS) {
    if (!form[field].trim()) {
      errors[field] = "This field is required.";
    }
  }

  if (form.postal_code && !POSTAL_CODE_RE.test(form.postal_code)) {
    errors.postal_code = "Enter a valid Canadian postal code (e.g. A1B 2C3).";
  }

  if (form.phone && !PHONE_RE.test(form.phone)) {
    errors.phone = "Enter a valid phone number.";
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive mt-1">{message}</p>;
}

export default function AgencyStep() {
  const { agency, setAgency } = useIntakeStore();
  const { registerValidator } = useIntakeContext();

  const [form, setForm] = useState<AgencyFormData>(agency);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof AgencyFormData, boolean>>>({});

  // Sync local form to store on change
  useEffect(() => {
    setAgency(form);
  }, [form, setAgency]);

  // Register validator with layout — runs when Next is clicked
  useEffect(() => {
    registerValidator(() => {
      const errs = validate(form);
      setErrors(errs);
      // Mark all required fields as touched so errors are visible
      const allTouched = REQUIRED_FIELDS.reduce(
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
    setErrors((prev) => ({
      ...prev,
      [field]: validate(form)[field],
    }));
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
            <Label htmlFor="address_line_1">Address line 1</Label>
            <Input
              {...field("address_line_1")}
              placeholder="Street address"
              className="h-11"
            />
            <FieldError
              message={
                touched.address_line_1 ? errors.address_line_1 : undefined
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address_line_2">Address line 2</Label>
            <Input
              id="address_line_2"
              value={form.address_line_2}
              onChange={(e) => handleChange("address_line_2", e.target.value)}
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
            <Select
              value={form.province}
              onValueChange={(val) => {
                handleChange("province", val);
                handleBlur("province");
              }}
            >
              <SelectTrigger
                id="province"
                className="h-11 w-full"
                aria-invalid={
                  touched.province && !!errors.province ? true : undefined
                }
              >
                <SelectValue placeholder="Select a province" />
              </SelectTrigger>
              <SelectContent>
                {PROVINCES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError
              message={touched.province ? errors.province : undefined}
            />
          </div>
        </div>

        {/* Country + Postal code */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="country">Country</Label>
            <Input
              {...field("country")}
              placeholder="Enter country"
              className="h-11"
            />
            <FieldError
              message={touched.country ? errors.country : undefined}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="postal_code">Postal code</Label>
            <Input
              {...field("postal_code")}
              placeholder="Enter postal code"
              className="h-11"
            />
            <FieldError
              message={touched.postal_code ? errors.postal_code : undefined}
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
