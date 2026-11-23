"use client";

import { CircleCheck, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { cn } from "@/common/lib/utils";

interface PasswordStatusMessageProps {
  id?: string;
  message: string;
  tone: "muted" | "destructive";
}

/** Hint / error line under a password input, with a leading status icon. */
function PasswordStatusMessage({
  id,
  message,
  tone,
}: PasswordStatusMessageProps) {
  return (
    <p
      id={id}
      data-slot="password-status"
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

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  /** Validation error; replaces the hint when present. */
  error?: string;
  /** Muted helper text shown while there is no error. */
  hint?: string;
  autoComplete?: string;
  required?: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

/**
 * Labelled password input with a show/hide toggle and an inline hint that is
 * swapped for the error message when validation fails. Presentational — the
 * parent owns the value and the validation.
 */
function PasswordField({
  id,
  label,
  value,
  placeholder,
  error,
  hint,
  autoComplete = "new-password",
  required,
  onChange,
  onBlur,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div data-slot="password-field" className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        <span>
          {label}
          {required ? (
            <span className="text-destructive" aria-hidden>
              *
            </span>
          ) : null}
        </span>
      </Label>

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
          aria-invalid={Boolean(error)}
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

      {error ? (
        <PasswordStatusMessage
          id={errorId}
          message={error}
          tone="destructive"
        />
      ) : hint ? (
        <PasswordStatusMessage id={hintId} message={hint} tone="muted" />
      ) : null}
    </div>
  );
}

export { PasswordField, PasswordStatusMessage };
export type { PasswordFieldProps };
