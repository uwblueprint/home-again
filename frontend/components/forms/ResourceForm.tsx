"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type FieldType = "text" | "number" | "textarea" | "select" | "checkbox";

interface SelectOption {
  label: string;
  value: string;
}

export interface ResourceFormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
}

export interface ResourceFormProps {
  fields: ResourceFormField[];
  initialValues: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void;
  mode: "create" | "edit";
}

type Errors = Record<string, string>;

function normalizeFieldValue(field: ResourceFormField, value: unknown): unknown {
  if (field.type === "checkbox") {
    return Boolean(value);
  }

  if (field.type === "number") {
    if (value === "" || value === null || value === undefined) {
      return "";
    }

    const numeric = Number(value);
    return Number.isNaN(numeric) ? value : numeric;
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function validateRequired(
  fields: ResourceFormField[],
  values: Record<string, unknown>
): Errors {
  const errors: Errors = {};

  fields.forEach((field) => {
    if (!field.required) {
      return;
    }

    const value = values[field.name];

    if (field.type === "checkbox") {
      if (!value) {
        errors[field.name] = `${field.label} is required`;
      }
      return;
    }

    if (value === null || value === undefined || String(value).trim() === "") {
      errors[field.name] = `${field.label} is required`;
    }
  });

  return errors;
}

export function ResourceForm({
  fields,
  initialValues,
  onSubmit,
  mode,
}: ResourceFormProps) {
  const normalizedInitialValues = useMemo(() => {
    const values: Record<string, unknown> = {};
    fields.forEach((field) => {
      values[field.name] = normalizeFieldValue(field, initialValues[field.name]);
    });
    return values;
  }, [fields, initialValues]);

  const [values, setValues] =
    useState<Record<string, unknown>>(normalizedInitialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setValues(normalizedInitialValues);
    setErrors({});
  }, [normalizedInitialValues]);

  const setValue = (name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) {
        return prev;
      }
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateRequired(fields, values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => {
        const value = values[field.name];
        const error = errors[field.name];
        const commonClasses = `w-full rounded border px-3 py-2 ${
          error ? "border-red-500" : "border-gray-300"
        }`;
        const inputId = `resource-field-${field.name}`;

        return (
          <div key={field.name} className="space-y-1">
            <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-600"> *</span>}
            </label>

            {field.type === "text" && (
              <input
                id={inputId}
                type="text"
                className={commonClasses}
                value={String(value ?? "")}
                placeholder={field.placeholder}
                disabled={field.disabled || isSubmitting}
                onChange={(e) => setValue(field.name, e.target.value)}
              />
            )}

            {field.type === "number" && (
              <input
                id={inputId}
                type="number"
                className={commonClasses}
                value={value === "" ? "" : String(value ?? "")}
                placeholder={field.placeholder}
                disabled={field.disabled || isSubmitting}
                onChange={(e) =>
                  setValue(
                    field.name,
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
            )}

            {field.type === "textarea" && (
              <textarea
                id={inputId}
                className={commonClasses}
                value={String(value ?? "")}
                placeholder={field.placeholder}
                disabled={field.disabled || isSubmitting}
                onChange={(e) => setValue(field.name, e.target.value)}
              />
            )}

            {field.type === "select" && (
              <select
                id={inputId}
                className={commonClasses}
                value={String(value ?? "")}
                disabled={field.disabled || isSubmitting}
                onChange={(e) => setValue(field.name, e.target.value)}
              >
                <option value="">Select an option</option>
                {(field.options || []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}

            {field.type === "checkbox" && (
              <label
                htmlFor={inputId}
                className="flex items-center gap-2 rounded border border-gray-300 px-3 py-2"
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={Boolean(value)}
                  disabled={field.disabled || isSubmitting}
                  onChange={(e) => setValue(field.name, e.target.checked)}
                />
                <span className="text-sm text-gray-700">{field.placeholder || field.label}</span>
              </label>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );
      })}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
}
