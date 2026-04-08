"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";

import { useCreateDonor } from "@/hooks/useApi";
import { cn } from "@/lib/utils";
import type {
  CreateDonorInput,
  DonationRequestContactFormErrors,
  DonationRequestContactFormSubmitStatus,
  DonationRequestContactFormValues,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_ALLOWED_CHARACTERS_REGEX = /^[+\d\s().-]+$/;

function isValidPhoneNumber(phone: string): boolean {
  const normalizedPhone = phone.replace(/\D/g, "");
  return (
    PHONE_ALLOWED_CHARACTERS_REGEX.test(phone) &&
    normalizedPhone.length >= 10 &&
    normalizedPhone.length <= 15
  );
}

function validateForm(
  values: DonationRequestContactFormValues
): DonationRequestContactFormErrors {
  const errors: DonationRequestContactFormErrors = {};

  if (!values.first_name.trim()) {
    errors.first_name = "First name is required.";
  }

  if (!values.last_name.trim()) {
    errors.last_name = "Last name is required.";
  }

  if (!values.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!isValidPhoneNumber(values.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }

  return errors;
}

export default function DonationContactForm() {
  const router = useRouter();
  const createDonor = useCreateDonor();
  const [values, setValues] = useState<DonationRequestContactFormValues>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<DonationRequestContactFormErrors>({});
  const [submitStatus, setSubmitStatus] =
    useState<DonationRequestContactFormSubmitStatus>(null);

  const handleChange =
    (field: keyof DonationRequestContactFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setValues((previous) => ({ ...previous, [field]: nextValue }));
      setSubmitStatus(null);

      if (errors[field]) {
        setErrors((previous) => ({ ...previous, [field]: undefined }));
      }
    };

  const handleBlur = (field: keyof DonationRequestContactFormValues) => {
    const nextErrors = validateForm(values);
    setErrors((previous) => ({
      ...previous,
      [field]: nextErrors[field],
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(values);
    setErrors(nextErrors);
    setSubmitStatus(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const payload: CreateDonorInput = {
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
    };

    createDonor.mutate(payload, {
      onSuccess: (createdDonor) => {
        if (createdDonor.id) {
          router.push(`/donate/${createdDonor.id}`);
          return;
        }
        setSubmitStatus({
          type: "error",
          text: "Your request was submitted, but we could not continue. Please try again.",
        });
      },
      onError: () => {
        setSubmitStatus({
          type: "error",
          text: "We could not submit your request. Please try again.",
        });
      },
    });
  };

  return (
    <div className="bg-background text-foreground">
      <div className="flex min-h-screen w-full items-stretch justify-start">
        <aside className="hidden w-[492px] shrink-0 p-5 md:flex">
          <div className="h-full w-full rounded-xl bg-border/60" />
        </aside>

        <section className="flex min-h-screen flex-1 items-center justify-center px-6 py-10 sm:px-8">
          <div className="w-full max-w-[476px] space-y-5">
            <Image
              src="/hafb_logo.svg"
              alt="Home Again Furniture Bank"
              width={91}
              height={55}
              className="h-auto w-auto"
              priority
            />

            <div className="space-y-3">
              <h1 className="font-semibold tracking-[-0.02em] text-[clamp(1.5rem,1.35rem+0.7vw,1.875rem)] leading-[clamp(1.875rem,1.8rem+0.25vw,1.95rem)]">
                Welcome!
              </h1>
              <p className="text-muted-foreground font-normal text-[clamp(0.95rem,0.9rem+0.25vw,1rem)] leading-6">
                Please enter your contact information to start donating
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="space-y-1">
                <Label
                  htmlFor="first_name"
                  className="font-medium text-foreground text-[clamp(0.825rem,0.78rem+0.2vw,0.875rem)] leading-5"
                >
                  First Name
                </Label>
                <Input
                  id="first_name"
                  name="first_name"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Enter First Name"
                  value={values.first_name}
                  onChange={handleChange("first_name")}
                  onBlur={() => handleBlur("first_name")}
                  aria-invalid={Boolean(errors.first_name)}
                  aria-describedby={errors.first_name ? "first_name-error" : undefined}
                  className="h-10 rounded-lg border-input bg-background text-[clamp(0.825rem,0.78rem+0.2vw,0.875rem)] leading-5 shadow-[0_1px_2px_0_rgba(0,0,0,0)]"
                />
                {errors.first_name ? (
                  <p
                    id="first_name-error"
                    className="text-destructive text-sm"
                    role="alert"
                  >
                    {errors.first_name}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="last_name"
                  className="font-medium text-foreground text-[clamp(0.825rem,0.78rem+0.2vw,0.875rem)] leading-5"
                >
                  Last Name
                </Label>
                <Input
                  id="last_name"
                  name="last_name"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Enter Last Name"
                  value={values.last_name}
                  onChange={handleChange("last_name")}
                  onBlur={() => handleBlur("last_name")}
                  aria-invalid={Boolean(errors.last_name)}
                  aria-describedby={errors.last_name ? "last_name-error" : undefined}
                  className="h-10 rounded-lg border-input bg-background text-[clamp(0.825rem,0.78rem+0.2vw,0.875rem)] leading-5 shadow-[0_1px_2px_0_rgba(0,0,0,0)]"
                />
                {errors.last_name ? (
                  <p id="last_name-error" className="text-destructive text-sm" role="alert">
                    {errors.last_name}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="email"
                  className="font-medium text-foreground text-[clamp(0.825rem,0.78rem+0.2vw,0.875rem)] leading-5"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter Email Address"
                  value={values.email}
                  onChange={handleChange("email")}
                  onBlur={() => handleBlur("email")}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className="h-10 rounded-lg border-input bg-background text-[clamp(0.825rem,0.78rem+0.2vw,0.875rem)] leading-5 shadow-[0_1px_2px_0_rgba(0,0,0,0)]"
                />
                {errors.email ? (
                  <p id="email-error" className="text-destructive text-sm" role="alert">
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="phone"
                  className="font-medium text-foreground text-[clamp(0.825rem,0.78rem+0.2vw,0.875rem)] leading-5"
                >
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="(+1)"
                  value={values.phone}
                  onChange={handleChange("phone")}
                  onBlur={() => handleBlur("phone")}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  className="h-10 rounded-lg border-input bg-background text-[clamp(0.825rem,0.78rem+0.2vw,0.875rem)] leading-5 shadow-[0_1px_2px_0_rgba(0,0,0,0)]"
                />
                {errors.phone ? (
                  <p id="phone-error" className="text-destructive text-sm" role="alert">
                    {errors.phone}
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                disabled={createDonor.isPending}
                className="h-10 w-full rounded-full bg-primary px-6 py-2.5 text-primary-foreground text-[clamp(0.825rem,0.78rem+0.2vw,0.875rem)] leading-5 font-medium hover:cursor-pointer disabled:cursor-not-allowed"
              >
                {createDonor.isPending ? "Submitting..." : "Submit a Donation Request"}
                <span aria-hidden="true">{"->"}</span>
              </Button>

              <p
                aria-live="polite"
                className={cn(
                  "min-h-5 text-sm",
                  submitStatus?.type === "error" ? "text-destructive" : "text-foreground"
                )}
              >
                {submitStatus?.text}
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
