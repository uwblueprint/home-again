"use client";

import { FormField } from "@/common/components/forms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui";

export function DetailSelect({
  id,
  label,
  value,
  options,
  onChange,
  error,
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const items =
    value && !options.some((option) => option.value === value)
      ? [...options, { value, label: value }]
      : options;
  return (
    <FormField label={label} htmlFor={id} error={error}>
      <Select
        items={items}
        disabled={disabled}
        value={value || null}
        onValueChange={(value) => onChange(value ?? "")}
      >
        <SelectTrigger id={id} className="w-full" aria-invalid={!!error}>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {items.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
