"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ChangeEvent, FormEvent, useState } from "react";

import { FormField, NewPasswordFields } from "@/common/components/forms";
import { EntrySplitLayout } from "@/common/components/layout";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { LOGIN_PAGE } from "@/common/constants/Routes";
import {
  type DonorContactErrors,
  validateDonorContact,
} from "@/common/constants/validators";
import { useNewPassword } from "@/common/hooks/useNewPassword";
import { cn } from "@/common/lib/utils";

/** Placeholders until the invite link / API supplies the real values. */
const MOCK_INVITE_EMAIL = "sam.walsh@avalonfamily.ca";
const MOCK_AGENCY_NAME = "Avalon Family Services";

type ProfileField = "first_name" | "last_name" | "phone";
type ProfileValues = Record<ProfileField, string>;

const INPUT_CLASS_NAME = "h-10";

export default function AccountSetupForm({
  email = MOCK_INVITE_EMAIL,
  agencyName = MOCK_AGENCY_NAME,
}: {
  /** Invite email for this agent. Locked; filled by the invite link later. */
  email?: string;
  /** Agency that invited this agent. */
  agencyName?: string;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileValues>({
    first_name: "",
    last_name: "",
    phone: "",
  });
  const [profileErrors, setProfileErrors] = useState<DonorContactErrors>({});
  const password = useNewPassword();

  function profileInputProps(field: ProfileField) {
    return {
      id: field,
      name: field,
      value: profile[field],
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setProfile((previous) => ({ ...previous, [field]: value }));
        if (profileErrors[field]) {
          setProfileErrors((previous) => ({ ...previous, [field]: undefined }));
        }
      },
      onBlur: () => {
        const next = validateDonorContact({ [field]: profile[field] });
        setProfileErrors((previous) => ({ ...previous, [field]: next[field] }));
      },
      "aria-invalid": Boolean(profileErrors[field]),
      className: INPUT_CLASS_NAME,
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextProfileErrors = validateDonorContact(profile);
    setProfileErrors(nextProfileErrors);
    const passwordErrors = password.validate();

    if (
      Object.keys(nextProfileErrors).length > 0 ||
      Object.keys(passwordErrors).length > 0
    ) {
      return;
    }

    // Frontend-only: no account API yet — send the agent to sign in.
    router.push(LOGIN_PAGE);
  }

  return (
    <EntrySplitLayout>
      <Image
        src="/hafb_logo.svg"
        alt="Home Again Furniture Bank"
        width={91}
        height={55}
        className="h-auto w-auto"
        priority
      />

      <div className="space-y-3">
        <h1 className="text-heading-2 font-semibold text-foreground">
          Create your account
        </h1>
        <p className="font-normal text-paragraph-regular text-muted-foreground">
          {agencyName} has invited you to join their Home Again agent portal.
          Tell us a bit about yourself and create a password.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="First name"
            htmlFor="first_name"
            error={profileErrors.first_name}
          >
            <Input
              {...profileInputProps("first_name")}
              autoComplete="given-name"
              placeholder="Enter first name"
            />
          </FormField>
          <FormField
            label="Last name"
            htmlFor="last_name"
            error={profileErrors.last_name}
          >
            <Input
              {...profileInputProps("last_name")}
              autoComplete="family-name"
              placeholder="Enter last name"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Email" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              disabled
              autoComplete="email"
              // Match the placeholder grey used by the other inputs.
              className={cn(
                INPUT_CLASS_NAME,
                "text-muted-foreground disabled:opacity-100"
              )}
            />
          </FormField>
          <FormField
            label="Phone number"
            htmlFor="phone"
            error={profileErrors.phone}
          >
            <Input
              {...profileInputProps("phone")}
              type="tel"
              autoComplete="tel"
              placeholder="Enter phone number"
            />
          </FormField>
        </div>

        <NewPasswordFields
          values={password.values}
          errors={password.errors}
          onChange={password.handleChange}
          onBlur={password.handleBlur}
        />

        <Button
          type="submit"
          size="xl"
          rounded
          className="h-10 w-full px-6 py-2.5 text-paragraph-small"
        >
          Create account
        </Button>
      </form>
    </EntrySplitLayout>
  );
}
