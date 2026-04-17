# Forms

This folder is the home for shared core form components — **not yet built**.

Each flow currently implements its own inline form fields with the same repeating pattern: `Label` + `Input` + error message. The components here should extract that pattern into reusable building blocks that every flow can import.

---

## Target Components

### `FormField`

The most important one. Wraps a label, an input slot, and an inline error message into a single unit with consistent spacing.

```tsx
// common/components/forms/FormField.tsx
import { Label } from "@/common/components/ui/label";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode; // the input element
}

export function FormField({ label, htmlFor, error, required, children }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
      <FieldError message={error} />
    </div>
  );
}
```

Usage:
```tsx
<FormField label="First name" htmlFor="first_name" error={errors.first_name} required>
  <Input
    id="first_name"
    value={values.first_name}
    onChange={handleChange("first_name")}
    onBlur={() => handleBlur("first_name")}
    aria-invalid={Boolean(errors.first_name)}
  />
</FormField>
```

---

### `FieldError`

Standalone inline error. Used by `FormField` internally, but also available on its own for cases that don't fit the standard layout.

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

This pattern already exists inline in every flow — for example, `app/agent-intake/agency/page.tsx` defines its own local `FieldError`. Once this component exists here, those inline copies should be deleted.

---

### `AddressForm`

A composable block for the standard Canadian address: street, apartment/unit, city, province, postal code. Used in both the agency intake and the donation pickup address flows.

```tsx
// common/components/forms/AddressForm.tsx
interface AddressFormProps {
  values: AddressFormValues;
  errors: Partial<Record<keyof AddressFormValues, string>>;
  onChange: (field: keyof AddressFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (field: keyof AddressFormValues) => void;
}

export interface AddressFormValues {
  address_line_1: string;
  address_line_2?: string;
  city: string;
  province: string;
  postal_code: string;
}

export function AddressForm({ values, errors, onChange, onBlur }: AddressFormProps) {
  return (
    <div className="space-y-4">
      <FormField label="Street address" htmlFor="address_line_1" error={errors.address_line_1} required>
        <Input id="address_line_1" value={values.address_line_1} onChange={onChange("address_line_1")} onBlur={() => onBlur("address_line_1")} />
      </FormField>
      <FormField label="Apartment / unit" htmlFor="address_line_2" error={errors.address_line_2}>
        <Input id="address_line_2" value={values.address_line_2 ?? ""} onChange={onChange("address_line_2")} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="City" htmlFor="city" error={errors.city} required>
          <Input id="city" value={values.city} onChange={onChange("city")} onBlur={() => onBlur("city")} />
        </FormField>
        <FormField label="Postal code" htmlFor="postal_code" error={errors.postal_code} required>
          <Input id="postal_code" value={values.postal_code} onChange={onChange("postal_code")} onBlur={() => onBlur("postal_code")} />
        </FormField>
      </div>
    </div>
  );
}
```

Flow-specific variants (e.g. `DonationAddressForm` with a pickup-specific heading or extra fields) should live in `app/<flow>/components/` and compose `AddressForm`:

```tsx
// app/donate/components/DonationAddressForm.tsx
import { AddressForm } from "@/common/components/forms/AddressForm";

export function DonationAddressForm(props: DonationAddressFormProps) {
  return (
    <section>
      <h2>Pickup address</h2>
      <AddressForm {...props} />
    </section>
  );
}
```

---

## Barrel

```ts
// common/components/forms/index.ts
export { FormField }    from "./FormField";
export { FieldError }   from "./FieldError";
export { AddressForm }  from "./AddressForm";
export type { AddressFormValues } from "./AddressForm";
```

---

## Validation

Form components here are presentational — they receive `errors` as props and display them. Validation logic (the `validate()` function) stays in the flow's `page.tsx` or context. Import shared regex from `common/constants/validators.ts`:

```ts
import { EMAIL_REGEX, PHONE_REGEX, POSTAL_CODE_REGEX } from "@/common/constants/validators";
```
