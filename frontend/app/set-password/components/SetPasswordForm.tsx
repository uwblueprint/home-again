"use client";

import Image from "next/image";
import { FormEvent } from "react";

import { FormField, NewPasswordFields } from "@/common/components/forms";
import { EntrySplitLayout } from "@/common/components/layout";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { useNewPassword } from "@/common/hooks/useNewPassword";

/** Placeholder until invite/token API supplies the real email. */
const MOCK_INVITE_EMAIL = "jordan.reid@avalonfamily.ca";

export default function SetPasswordForm({
  email = MOCK_INVITE_EMAIL,
}: {
  /** Invite email for this user. Filled by the invite link once backend lands. */
  email?: string;
}) {
  const { values, errors, handleChange, handleBlur, validate } =
    useNewPassword();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    validate();
    // Frontend-only: validate locally. No API call yet.
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
          Set your password
        </h1>
        <p className="font-normal text-paragraph-regular text-muted-foreground">
          You&apos;ve been invited to join Home Again as the primary contact for
          your agency. Create a password to get started.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            disabled
            autoComplete="email"
            className="h-10 font-normal text-paragraph-small text-[#B9B9B9] disabled:opacity-100"
          />
        </FormField>

        <NewPasswordFields
          values={values}
          errors={errors}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <Button
          type="submit"
          size="xl"
          rounded
          className="h-10 w-full px-6 py-2.5 text-paragraph-small"
        >
          Set password
        </Button>
      </form>
    </EntrySplitLayout>
  );
}
