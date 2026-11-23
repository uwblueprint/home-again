"use client";

import {
  MIN_PASSWORD_LENGTH,
  type NewPasswordErrors,
  type NewPasswordField,
} from "@/common/constants/validators";

import { PasswordField } from "./PasswordField";

export interface NewPasswordValues {
  password: string;
  confirmPassword: string;
}

interface NewPasswordFieldsProps {
  values: NewPasswordValues;
  errors: NewPasswordErrors;
  onChange: (field: NewPasswordField, value: string) => void;
  onBlur?: (field: NewPasswordField) => void;
  passwordLabel?: string;
  passwordPlaceholder?: string;
}

/**
 * Password + confirm-password block shared by the set-password, reset-password
 * and account-setup screens. Presentational: validate with
 * `validateNewPassword` from `@/common/constants/validators`.
 */
export function NewPasswordFields({
  values,
  errors,
  onChange,
  onBlur,
  passwordLabel = "Password",
  passwordPlaceholder = "Create a password",
}: NewPasswordFieldsProps) {
  return (
    <>
      <PasswordField
        id="password"
        label={passwordLabel}
        value={values.password}
        placeholder={passwordPlaceholder}
        error={errors.password}
        hint={`Password must be at least ${MIN_PASSWORD_LENGTH} characters`}
        onChange={(value) => onChange("password", value)}
        onBlur={() => onBlur?.("password")}
      />
      <PasswordField
        id="confirmPassword"
        label="Confirm password"
        value={values.confirmPassword}
        placeholder="Re-enter your password"
        error={errors.confirmPassword}
        onChange={(value) => onChange("confirmPassword", value)}
        onBlur={() => onBlur?.("confirmPassword")}
      />
    </>
  );
}
