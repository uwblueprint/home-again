"use client";

import React, { useEffect, useState } from "react";

import IntakeStepPage from "@/app/agent-intake/components/IntakeStepPage";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { useIntakeContext } from "@/app/agent-intake/context/IntakeContext";
import {
  useIntakeFormStore,
  type MainAgentFormData,
} from "@/app/agent-intake/stores/intakeFormStore";
import { useAuthStore } from "@/common/stores/authStore";

import { EMAIL_REGEX, PHONE_REGEX } from "@/common/constants/validators";

const AUTH_STUB = {
  firstName: "",
  lastName: "",
  email: "",
};

type FormErrors = Partial<Record<keyof MainAgentFormData, string>>;

function validate(form: MainAgentFormData): FormErrors {
  const errors: FormErrors = {};

  if (!form.firstName.trim()) errors.firstName = "Enter your first name.";
  if (!form.lastName.trim()) errors.lastName = "Enter your last name.";
  if (!form.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.phone.trim()) {
    errors.phone = "Enter your phone number.";
  } else if (!PHONE_REGEX.test(form.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }

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
    <p role="alert" className="mt-1 text-sm text-destructive">
      {message}
    </p>
  );
}

export default function MainAgentStep() {
  const { mainAgent, setMainAgent } = useIntakeFormStore();
  const { registerValidator } = useIntakeContext();
  const user = useAuthStore((state) => state.user);
  const hasLockedIdentity = Boolean(
    user?.firstName || user?.lastName || user?.email
  );

  const [form, setForm] = useState<MainAgentFormData>(() => ({
    ...mainAgent,
    firstName: user?.firstName || mainAgent.firstName || AUTH_STUB.firstName,
    lastName: user?.lastName || mainAgent.lastName || AUTH_STUB.lastName,
    email: user?.email || mainAgent.email || AUTH_STUB.email,
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof MainAgentFormData, boolean>>
  >({});

  useEffect(() => {
    if (!hasLockedIdentity) {
      return;
    }

    setForm((current) => ({
      ...current,
      firstName: user?.firstName || current.firstName,
      lastName: user?.lastName || current.lastName,
      email: user?.email || current.email,
    }));
  }, [hasLockedIdentity, user?.email, user?.firstName, user?.lastName]);

  useEffect(() => {
    setMainAgent(form);
  }, [form, setMainAgent]);

  useEffect(() => {
    registerValidator(() => {
      const nextErrors = validate(form);
      setErrors(nextErrors);
      const allTouched = TOUCHED_ON_SUBMIT.reduce(
        (acc, field) => ({ ...acc, [field]: true }),
        {} as Partial<Record<keyof MainAgentFormData, boolean>>
      );
      setTouched(allTouched);
      return Object.keys(nextErrors).length === 0;
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
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      handleChange(id, event.target.value),
    onBlur: () => handleBlur(id),
    "aria-invalid": touched[id] && !!errors[id] ? (true as const) : undefined,
  });

  return (
    <IntakeStepPage
      title="Your Details"
      description="Enter your details as the primary contact for your agency account."
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="firstName">First name</Label>
            <Input
              {...field("firstName")}
              placeholder="Enter first name"
              className="h-11"
              readOnly={hasLockedIdentity}
              disabled={hasLockedIdentity}
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
              readOnly={hasLockedIdentity}
              disabled={hasLockedIdentity}
            />
            <FieldError
              message={touched.lastName ? errors.lastName : undefined}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              {...field("email")}
              type="email"
              placeholder="name@agency.org"
              className="h-11"
              readOnly={hasLockedIdentity}
              disabled={hasLockedIdentity}
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
      </div>
    </IntakeStepPage>
  );
}
