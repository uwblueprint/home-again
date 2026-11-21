"use client";

import Image from "next/image";
import { CircleCheck, Eye, EyeOff } from "lucide-react";
import { FormEvent, useState } from "react";

import { FormField } from "@/common/components/forms/FormField";
import { EntrySplitLayout } from "@/common/components/layout";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { cn } from "@/common/lib/utils";

const MIN_PASSWORD_LENGTH = 8;
/** Placeholder until invite/token API supplies the real email. */
const MOCK_INVITE_EMAIL = "jordan.reid@avalonfamily.ca";

type Field = "password" | "confirmPassword";
type Errors = Partial<Record<Field, string>>;

function validate(password: string, confirmPassword: string): Errors {
  const errors: Errors = {};

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = "Password is less than 8 characters, please re-enter";
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match, please re-enter";
  }

  return errors;
}

function StatusMessage({
  id,
  message,
  tone,
}: {
  id?: string;
  message: string;
  tone: "muted" | "destructive";
}) {
  return (
    <p
      id={id}
      role={tone === "destructive" ? "alert" : undefined}
      className={cn(
        "flex items-start gap-1.5 font-normal text-paragraph-mini",
        tone === "destructive"
          ? "[color:var(--unofficial-destructive-text)]"
          : "text-muted-foreground"
      )}
    >
      <CircleCheck className="mt-0.5 size-3 shrink-0" aria-hidden />
      <span>{message}</span>
    </p>
  );
}

function PasswordField({
  id,
  value,
  placeholder,
  autoComplete,
  invalid,
  describedBy,
  onChange,
  onBlur,
}: {
  id: string;
  value: string;
  placeholder: string;
  autoComplete: string;
  invalid: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        name={id}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className="h-10 pr-10"
      />
      <button
        type="button"
        onClick={() => setVisible((previous) => !previous)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden />
        ) : (
          <Eye className="size-4" aria-hidden />
        )}
      </button>
    </div>
  );
}

export default function SetPasswordForm({
  email = MOCK_INVITE_EMAIL,
}: {
  /** Invite email for this user. Filled by the invite link once backend lands. */
  email?: string;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  function clearError(field: Field) {
    if (!errors[field]) return;
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  function handleBlur(field: Field) {
    const next = validate(password, confirmPassword);
    setErrors((previous) => ({ ...previous, [field]: next[field] }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors(validate(password, confirmPassword));
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

        <FormField label="Password" htmlFor="password">
          <PasswordField
            id="password"
            value={password}
            placeholder="Create a password"
            autoComplete="new-password"
            invalid={Boolean(errors.password)}
            describedBy={errors.password ? "password-error" : "password-hint"}
            onChange={(value) => {
              setPassword(value);
              clearError("password");
            }}
            onBlur={() => handleBlur("password")}
          />
          {errors.password ? (
            <StatusMessage
              id="password-error"
              message={errors.password}
              tone="destructive"
            />
          ) : (
            <StatusMessage
              id="password-hint"
              message={`Password must be at least ${MIN_PASSWORD_LENGTH} characters`}
              tone="muted"
            />
          )}
        </FormField>

        <FormField label="Confirm password" htmlFor="confirmPassword">
          <PasswordField
            id="confirmPassword"
            value={confirmPassword}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            invalid={Boolean(errors.confirmPassword)}
            describedBy={
              errors.confirmPassword ? "confirmPassword-error" : undefined
            }
            onChange={(value) => {
              setConfirmPassword(value);
              clearError("confirmPassword");
            }}
            onBlur={() => handleBlur("confirmPassword")}
          />
          {errors.confirmPassword ? (
            <StatusMessage
              id="confirmPassword-error"
              message={errors.confirmPassword}
              tone="destructive"
            />
          ) : null}
        </FormField>

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
