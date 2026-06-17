# Forms

This folder holds shared form building blocks used across multiple flows.

Each flow (donate, agent-intake, referral) currently has its own form fields written inline — the same `Label + Input + error message` pattern repeated everywhere. The components here extract that repetition into reusable pieces so you write it once and import it anywhere.

> **Not yet built.** The examples below are the intended implementation. See the usage notes for how to handle forms in the meantime.

---

## Why these components exist

Without shared form components, every form field looks like this (repeated across dozens of files):

```tsx
<div className="space-y-1">
  <Label htmlFor="email">Email address</Label>
  <Input
    id="email"
    type="email"
    value={values.email}
    onChange={handleChange("email")}
    aria-invalid={Boolean(errors.email)}
  />
  {errors.email ? (
    <p role="alert" className="text-sm text-destructive">
      {errors.email}
    </p>
  ) : null}
</div>
```

With `FormField` + `FieldError`, that becomes:

```tsx
<FormField label="Email address" htmlFor="email" error={errors.email}>
  <Input
    id="email"
    type="email"
    value={values.email}
    onChange={handleChange("email")}
  />
</FormField>
```

Same result, half the code, consistent spacing and error styling everywhere.

---

## Components

### `FieldError`

Displays an inline validation error below a field. Returns nothing if there's no message, so you never need to conditionally render it yourself.

```tsx
// common/components/forms/FieldError.tsx
interface FieldErrorProps {
  message?: string;
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}
```

**When to use on its own:** Only when the standard `FormField` layout doesn't fit — for example, an error below a checkbox group or a custom file input. In normal cases, use `FormField` which includes `FieldError` automatically.

> This pattern already exists inline in every flow. For example, `app/agent-intake/agency/page.tsx` defines its own local `FieldError` function. Once this component exists here, those inline copies should be removed and replaced with an import.

---

### `FormField`

Wraps a label, any input element, and an error message into one consistent unit. The input is passed as `children` so `FormField` works with any input type — text, select, textarea, custom components, anything.

```tsx
// common/components/forms/FormField.tsx
import { Label } from "@/common/components/ui/label";
import { FieldError } from "./FieldError";

interface FormFieldProps {
  label: string;
  htmlFor: string; // must match the id on the input inside children
  error?: string; // validation error to display; omit or pass undefined when valid
  required?: boolean; // shows a red asterisk next to the label
  children: React.ReactNode;
}

export function FormField({
  label,
  htmlFor,
  error,
  required,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={htmlFor}>
        {label}
        {required && (
          <span className="ml-1 text-destructive" aria-hidden>
            *
          </span>
        )}
      </Label>
      {children}
      <FieldError message={error} />
    </div>
  );
}
```

**Usage:**

```tsx
import { FormField } from "@/common/components/forms/FormField";
import { Input } from "@/common/components/ui/input";

// Inside your form JSX:
<FormField
  label="First name"
  htmlFor="first_name"
  error={errors.first_name}
  required
>
  <Input
    id="first_name"
    value={values.first_name}
    onChange={handleChange("first_name")}
    onBlur={() => handleBlur("first_name")}
    aria-invalid={Boolean(errors.first_name)}
  />
</FormField>;
```

The `htmlFor` on `FormField` and the `id` on `Input` must match — this is what connects the label to the input for accessibility (clicking the label focuses the input).

---

### `AddressForm`

A self-contained block for a Canadian address: street address, apartment/unit, city, province, and postal code. Used in both the agency intake form and the donation pickup address.

Rather than each flow duplicating five address fields, they import this block and pass in their form state.

```tsx
// common/components/forms/AddressForm.tsx
import { Input } from "@/common/components/ui/input";
import { FormField } from "./FormField";

// The shape of an address in form state
export interface AddressFormValues {
  address_line_1: string;
  address_line_2?: string;
  city: string;
  province: string;
  postal_code: string;
}

interface AddressFormProps {
  values: AddressFormValues;
  // errors is a partial object — only fields with errors need an entry
  errors: Partial<Record<keyof AddressFormValues, string>>;
  onChange: (
    field: keyof AddressFormValues
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (field: keyof AddressFormValues) => void;
}

export function AddressForm({
  values,
  errors,
  onChange,
  onBlur,
}: AddressFormProps) {
  return (
    <div className="space-y-4">
      <FormField
        label="Street address"
        htmlFor="address_line_1"
        error={errors.address_line_1}
        required
      >
        <Input
          id="address_line_1"
          value={values.address_line_1}
          onChange={onChange("address_line_1")}
          onBlur={() => onBlur("address_line_1")}
          aria-invalid={Boolean(errors.address_line_1)}
        />
      </FormField>

      <FormField
        label="Apartment / unit"
        htmlFor="address_line_2"
        error={errors.address_line_2}
      >
        <Input
          id="address_line_2"
          value={values.address_line_2 ?? ""}
          onChange={onChange("address_line_2")}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="City" htmlFor="city" error={errors.city} required>
          <Input
            id="city"
            value={values.city}
            onChange={onChange("city")}
            onBlur={() => onBlur("city")}
            aria-invalid={Boolean(errors.city)}
          />
        </FormField>

        <FormField
          label="Postal code"
          htmlFor="postal_code"
          error={errors.postal_code}
          required
        >
          <Input
            id="postal_code"
            value={values.postal_code}
            onChange={onChange("postal_code")}
            onBlur={() => onBlur("postal_code")}
            aria-invalid={Boolean(errors.postal_code)}
          />
        </FormField>
      </div>
    </div>
  );
}
```

**Flow-specific variants:** If a flow needs the address block with extra context (a section heading, an extra field, different labels), create a variant in that flow's `components/` folder that wraps `AddressForm`:

```tsx
// app/donate/components/DonationAddressForm.tsx
import {
  AddressForm,
  type AddressFormValues,
} from "@/common/components/forms/AddressForm";

interface DonationAddressFormProps {
  values: AddressFormValues;
  errors: Partial<Record<keyof AddressFormValues, string>>;
  onChange: (
    field: keyof AddressFormValues
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (field: keyof AddressFormValues) => void;
}

export function DonationAddressForm(props: DonationAddressFormProps) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold">Pickup address</h2>
      <p className="text-sm text-muted-foreground">
        Where should we pick up the furniture?
      </p>
      <AddressForm {...props} />
    </section>
  );
}
```

---

### `FileUpload`

A modal file-upload dialog, used in the donation flow for uploading furniture photos. Handles preview generation, file-list state, drag-and-drop, and an accessible focus trap.

It is configurable via props rather than photo-specific: `accept` controls the allowed file types and `maxFiles` controls the upload limit. Image files render as thumbnails; other file types render a generic file icon with the file name.

> **Extracted.** It lives in `common/components/file-upload/FileUpload.tsx` (imported from `@/common/components/file-upload`) and supersedes the former `app/donate/components/PhotoUpload.tsx`.

It is controlled: the parent owns the dialog's open state and the saved file list. Open it from a trigger, and commit the chosen files in `onSave`:

```tsx
import { useState } from "react";
import { FileUpload } from "@/common/components/file-upload";
import { Button } from "@/common/components/ui/button";

function ItemPhotos() {
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Upload Photos
      </Button>

      <FileUpload
        open={open}
        onOpenChange={setOpen}
        currentFiles={photos}
        onSave={setPhotos}
        accept="image/*"
        maxFiles={5}
        title="Upload Photos of Your Item"
      />
    </>
  );
}
```

`currentFiles` seeds the dialog when it opens; `onSave` fires with the final list when the user confirms. Omit `accept` to allow any file type, and `maxFiles` defaults to 5.

---

## Important: form components are presentational

The components in this folder **display** data and errors — they do not own validation logic.

- Validation (the `validate()` function, the error messages) lives in the flow's `page.tsx` or context file
- These components receive `errors` as props and render them
- Import shared regex patterns from `common/constants/validators.ts`, not inline

```ts
// In your flow's page.tsx or context:
import { EMAIL_REGEX, POSTAL_CODE_REGEX } from "@/common/constants/validators";

function validate(values) {
  const errors = {};
  if (!EMAIL_REGEX.test(values.email))
    errors.email = "Enter a valid email address.";
  if (!POSTAL_CODE_REGEX.test(values.postal_code))
    errors.postal_code = "Enter a valid postal code.";
  return errors;
}
```

---

## In the meantime

Until these components are built, implement form fields inline in your flow following the same shape shown above. When you're ready to extract, the pattern is already consistent — just move the markup into `FormField` and `FieldError` here, then update the imports.

---

## Barrel export

```ts
// common/components/forms/index.ts
export { FormField } from "./FormField";
export { FieldError } from "./FieldError";
export { AddressForm } from "./AddressForm";
export type { AddressFormValues } from "./AddressForm";
```
