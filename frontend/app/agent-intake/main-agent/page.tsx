"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIntakeContext } from "@/context/IntakeContext";
import {
  useIntakeFormStore,
  type MainAgentFormData,
} from "@/stores/intakeFormStore";

type FormErrors = Partial<Record<keyof MainAgentFormData, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s()+\-]{7,20}$/;

function validate(form: MainAgentFormData): FormErrors {
  const errors: FormErrors = {};

  if (!form.firstName.trim()) errors.firstName = "Enter your first name.";
  if (!form.lastName.trim()) errors.lastName = "Enter your last name.";
  if (!form.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!EMAIL_RE.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.phone.trim()) {
    errors.phone = "Enter your phone number.";
  } else if (!PHONE_RE.test(form.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }
  // role is optional — no required validation

  return errors;
}

const TOUCHED_ON_SUBMIT: (keyof MainAgentFormData)[] = [
  "firstName",
  "lastName",
  "email",
  "phone",
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm text-destructive mt-1">
      {message}
    </p>
  );
}

export default function MainAgentStep() {
  const { mainAgent, setMainAgent } = useIntakeFormStore();
  const { registerValidator } = useIntakeContext();

  const [form, setForm] = useState<MainAgentFormData>(mainAgent);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof MainAgentFormData, boolean>>
  >({});

  // Sync local form to store on change
  useEffect(() => {
    setMainAgent(form);
  }, [form, setMainAgent]);

  // Register validator with layout — runs when Next is clicked
  useEffect(() => {
    registerValidator(() => {
      const errs = validate(form);
      setErrors(errs);
      const allTouched = TOUCHED_ON_SUBMIT.reduce(
        (acc, f) => ({ ...acc, [f]: true }),
        {} as Partial<Record<keyof MainAgentFormData, boolean>>
      );
      setTouched(allTouched);
      return Object.keys(errs).length === 0;
    });
    return () => registerValidator(null);
  }, [form, registerValidator]);

  function handleChange(field: keyof MainAgentFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: validate({ ...form, [field]: value })[field],
      }));
    }
  }

  function handleBlur(field: keyof MainAgentFormData) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validate(form)[field] }));
  }

  const field = (id: keyof MainAgentFormData) => ({
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
        Your Details
      </h2>
      <p className="text-muted-foreground mb-8">
        Enter your details as the primary contact for your agency account.
      </p>

      <div className="flex flex-col gap-6">
        {/* First name + Last name */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="firstName">First name</Label>
            <Input
              {...field("firstName")}
              placeholder="Enter first name"
              className="h-11"
            />
            <FieldError
              message={touched.firstName ? errors.firstName : undefined}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              {...field("lastName")}
              placeholder="Enter last name"
              className="h-11"
            />
            <FieldError
              message={touched.lastName ? errors.lastName : undefined}
            />
          </div>
        </div>

        {/* Email + Phone number */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              {...field("email")}
              type="email"
              placeholder="name@agency.org"
              className="h-11"
            />
            <FieldError message={touched.email ? errors.email : undefined} />
          </div>
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

        {/* Role */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="role">Role</Label>
          <Input
            {...field("role")}
            placeholder="e.g. Executive Directory, Program Manager, etc."
            className="h-11"
          />
        </div>
      </div>
    </div>
  );
}
