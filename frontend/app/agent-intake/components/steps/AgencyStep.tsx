"use client";

import React, { useEffect, useState } from "react";

import IntakeStepPage from "@/app/agent-intake/components/IntakeStepPage";
import { FormField } from "@/common/components/forms";
import { Input } from "@/common/components/ui/input";
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

function validate(form: AgencyFormData): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) errors.name = "Enter your agency name.";
  if (!form.addressLine1.trim())
    errors.addressLine1 = "Enter a street address.";
  if (!form.city.trim()) errors.city = "Enter your city.";
  if (!form.province.trim()) errors.province = "Select a province.";
  if (!form.country.trim()) errors.country = "Select a country.";
  if (!form.postalCode.trim()) errors.postalCode = "Enter your postal code.";
  if (!form.phone.trim()) errors.phone = "Enter your phone number.";

  if (form.postalCode && !POSTAL_CODE_REGEX.test(form.postalCode.trim())) {
    errors.postalCode = "Enter a valid Canadian postal code (e.g. A1B 2C3).";
  }

  if (form.phone && !PHONE_REGEX.test(form.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }

  if (form.url.trim() && !/^https?:\/\/.+/i.test(form.url.trim())) {
    errors.url = "Enter a valid URL (e.g. https://agency.org).";
  }

  return errors;
}

const TOUCHED_ON_SUBMIT: (keyof AgencyFormData)[] = [
  "name",
  "addressLine1",
  "city",
  "province",
  "country",
  "postalCode",
  "phone",
];

const inputClassName = "h-11 border-border bg-background";

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

  function handleSelectChange(field: "province" | "country", value: string) {
    const nextForm = { ...form, [field]: value };
    setForm(nextForm);
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: validate(nextForm)[field],
    }));
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
      showServiceAreaNotice
    >
      <div className="flex flex-col gap-6">
        <FormField
          label="Agency name"
          htmlFor="name"
          required
          error={touched.name ? errors.name : undefined}
        >
          <Input
            {...field("name")}
            placeholder="Enter your agency name"
            className={inputClassName}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Address line 1"
            htmlFor="addressLine1"
            required
            error={touched.addressLine1 ? errors.addressLine1 : undefined}
          >
            <Input
              {...field("addressLine1")}
              placeholder="Street address"
              className={inputClassName}
            />
          </FormField>
          <FormField label="Address line 2" htmlFor="addressLine2">
            <Input
              id="addressLine2"
              value={form.addressLine2}
              onChange={(event) =>
                handleChange("addressLine2", event.target.value)
              }
              placeholder="Suite, unit, floor, or building"
              className={inputClassName}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="City"
            htmlFor="city"
            required
            error={touched.city ? errors.city : undefined}
          >
            <Input
              {...field("city")}
              placeholder="Enter city"
              className={inputClassName}
            />
          </FormField>
          <FormField
            label="Province"
            htmlFor="province"
            required
            error={touched.province ? errors.province : undefined}
          >
            <Select
              value={form.province}
              onValueChange={(value) =>
                value && handleSelectChange("province", value)
              }
            >
              <SelectTrigger
                id="province"
                className="!h-11 w-full py-0"
                aria-invalid={
                  touched.province && !!errors.province
                    ? (true as const)
                    : undefined
                }
              >
                <SelectValue placeholder="Select a province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Newfoundland and Labrador">
                  Newfoundland and Labrador
                </SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Country"
            htmlFor="country"
            required
            error={touched.country ? errors.country : undefined}
          >
            <Select
              value={form.country}
              onValueChange={(value) =>
                value && handleSelectChange("country", value)
              }
            >
              <SelectTrigger
                id="country"
                className="!h-11 w-full py-0"
                aria-invalid={
                  touched.country && !!errors.country
                    ? (true as const)
                    : undefined
                }
              >
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Canada">Canada</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            label="Postal code"
            htmlFor="postalCode"
            required
            error={touched.postalCode ? errors.postalCode : undefined}
          >
            <Input
              {...field("postalCode")}
              placeholder="Enter postal code"
              className={inputClassName}
            />
          </FormField>
        </div>

        <FormField
          label="Phone number"
          htmlFor="phone"
          required
          error={touched.phone ? errors.phone : undefined}
        >
          <Input
            {...field("phone")}
            type="tel"
            placeholder="Enter phone number"
            className={inputClassName}
          />
        </FormField>

        <FormField
          label="Agency URL"
          htmlFor="url"
          error={touched.url ? errors.url : undefined}
        >
          <Input
            {...field("url")}
            type="url"
            placeholder="https://agency.org"
            className={inputClassName}
          />
        </FormField>
      </div>
    </IntakeStepPage>
  );
}
