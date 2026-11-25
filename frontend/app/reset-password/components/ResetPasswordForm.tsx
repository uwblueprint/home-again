"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

import { NewPasswordFields } from "@/common/components/forms";
import { EntrySplitLayout } from "@/common/components/layout";
import { Button } from "@/common/components/ui/button";
import {
  PASSWORD_RESET_QUERY_KEY,
  PASSWORD_RESET_QUERY_SUCCESS,
} from "@/common/constants/AuthConstants";
import { LOGIN_PAGE } from "@/common/constants/Routes";
import { useNewPassword } from "@/common/hooks/useNewPassword";

export default function ResetPasswordForm() {
  const router = useRouter();
  const { values, errors, handleChange, handleBlur, validate } =
    useNewPassword();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (Object.keys(validate()).length > 0) return;

    // Frontend-only: no reset API yet — go straight back to login.
    router.push(
      `${LOGIN_PAGE}?${PASSWORD_RESET_QUERY_KEY}=${PASSWORD_RESET_QUERY_SUCCESS}`
    );
  }

  return (
    <EntrySplitLayout showPanel={false}>
      <Image
        src="/hafb_logo.svg"
        alt="Home Again Furniture Bank"
        width={91}
        height={55}
        className="h-auto w-auto"
        priority
      />

      <h1 className="text-heading-2 font-semibold text-foreground">
        Agent Portal Password Reset
      </h1>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <NewPasswordFields
          values={values}
          errors={errors}
          onChange={handleChange}
          onBlur={handleBlur}
          passwordLabel="New Password"
          passwordPlaceholder="Create a new password"
        />

        <Button
          type="submit"
          size="xl"
          rounded
          className="h-10 w-full px-6 py-2.5 text-paragraph-small"
        >
          Reset Password
        </Button>
      </form>
    </EntrySplitLayout>
  );
}
