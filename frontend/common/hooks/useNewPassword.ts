"use client";

import { useState } from "react";

import {
  type NewPasswordErrors,
  type NewPasswordField,
  validateNewPassword,
} from "@/common/constants/validators";

/**
 * State for a password + confirm-password pair. Errors clear as the user types,
 * re-validate per field on blur, and `validate()` checks both on submit.
 */
export function useNewPassword() {
  const [values, setValues] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<NewPasswordErrors>({});

  function handleChange(field: NewPasswordField, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    if (errors[field]) {
      setErrors((previous) => ({ ...previous, [field]: undefined }));
    }
  }

  function handleBlur(field: NewPasswordField) {
    const next = validateNewPassword(values.password, values.confirmPassword);
    setErrors((previous) => ({ ...previous, [field]: next[field] }));
  }

  /** Validates both fields, shows every error, and returns them. */
  function validate(): NewPasswordErrors {
    const next = validateNewPassword(values.password, values.confirmPassword);
    setErrors(next);
    return next;
  }

  return { values, errors, handleChange, handleBlur, validate };
}
