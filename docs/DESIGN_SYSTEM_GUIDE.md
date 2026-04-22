# Design System Guide

This guide covers how to use the Home Again design system: Figma tokens, Tailwind utilities, shadcn components, and how to build composed components from them.

For code architecture (directory structure, state management, types, etc.), see [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md).

---

## 1. Overview

The design system has four layers, each building on the one below:

```
Figma (design source of truth)
  ↓ obra-shadcn plugin export
styles/*.css                 ← raw CSS variables (colors, typography, spacing)
  ↓ @theme inline in globals.css
Tailwind utilities           ← bg-primary, text-heading-1, p-md, etc.
  ↓ npx shadcn add
common/components/ui/        ← shadcn atoms (Button, Input, Dialog, …)
  ↓ compose manually
common/components/<group>/   ← composed components (FormField, ConfirmModal, …)
```

Each layer can be used independently — you can use a raw CSS variable, a Tailwind utility, a shadcn atom, or a composed component, depending on how much abstraction the situation needs.

---

## 2. The Token Pipeline

Tokens start in Figma and end as Tailwind utility classes. Here is every step:

```
Figma token
  → exported to styles/colors.css (or typography.css, spacing.css)
  → CSS variable: --primary: oklch(0.526 0.126 349)
  → mapped in @theme inline: --color-primary: var(--primary)
  → Tailwind utility: bg-primary, text-primary, border-primary
```

**The key rule:** CSS variables alone do not create Tailwind utilities. The `@theme inline` block in `app/globals.css` is what bridges them. If you add a token to a CSS file but not to `@theme inline`, the only way to use it is via `bg-[var(--my-token)]`.

### When to add to `@theme inline`

- **Yes**: the token will be used across multiple components or flows → add it so developers can write `bg-status-success`
- **No**: the token is only used in one place → use `bg-[var(--status-success)]` directly

### Ensuring utilities are always generated

Tailwind only generates a utility class if it finds that exact string somewhere in the scanned source files. This means a dynamically constructed class like `` `gap-${size}` `` will be silently dropped if `gap-lg` never appears as a complete string elsewhere.

The fix is `@source inline(...)` in `globals.css` — it acts as a safelist. The spacing and typography scales are already covered. If you add a new token scale (e.g. `--color-status-*`), add a corresponding `@source inline` if you expect dynamic usage:

```css
@source inline("bg-{status-success,status-warning,status-error} text-{status-success,status-warning,status-error}");
```

---

## 3. Token Files

All token files live in `styles/` and are imported by `app/globals.css`.

### `colors.css`

Contains four categories of color tokens, all using oklch values:

| Category | Example variable | Description |
|---|---|---|
| Brand raw | `--brand-colors-brand-colours-50` | Raw Figma palette values — don't use these directly |
| Semantic | `--general-primary`, `--general-foreground` | Semantic intent (primary, foreground, destructive) |
| shadcn bridge | `--primary`, `--foreground`, `--border` | Names expected by shadcn components — map to semantic tokens |
| Unofficial | `--unofficial-outline-hover`, `--unofficial-ghost` | Convenience tokens pending design system stabilisation |

The chain `--color-primary → --primary → --general-primary → --brand-colors-…` is intentional. Figma's semantic layer → shadcn's expected names → Tailwind utilities. Do not flatten this chain.

**Wired Tailwind utilities (colors):** `bg-primary`, `text-foreground`, `border-border`, `bg-destructive`, `bg-muted`, `text-muted-foreground`, `bg-accent`, `bg-card`, `bg-popover`, and all their `-foreground` variants.

### `typography.css`

Contains font size, line height, letter spacing, and font weight for each text style. All values come from Figma.

| Token group | CSS variables | Notes |
|---|---|---|
| Headings | `--heading-1-font-size`, `--heading-1-line-height`, `--heading-1-weight`, … | h1–h4 |
| Paragraphs | `--paragraph-large-font-size`, `--paragraph-regular-…`, `--paragraph-small-…`, `--paragraph-mini-…` | Body text |
| Caption | `--caption-font-size`, `--caption-line-height` | Small labels |
| Font weights | `--paragraph-paragraph-weight: 400`, `--paragraph-paragraph-bold-weight: 600` | Numeric — Figma exports these as strings (`Semibold`) which are invalid CSS; they are stored here as numbers |
| Font families | `--font-definitions-font-family-sans: Geist`, … | Figma-exported names — mapped to `--font-sans` / `--font-mono` in `typography.css`; actual font files are loaded in `app/layout.tsx` via `next/font/google` |

**Wired Tailwind utilities (typography):** `text-heading-1`, `text-heading-2`, `text-heading-3`, `text-heading-4`, `text-paragraph-large`, `text-paragraph-regular`, `text-paragraph-small`, `text-paragraph-mini`, `text-caption`. Each sets both `font-size` and `line-height`.

**Font weights** use standard Tailwind utilities: `font-normal` (400), `font-medium` (500), `font-semibold` (600).

**Adding a new text style** — use the companion variable pattern in `app/globals.css` (the `/` shorthand does not work with `var()` references):

```css
@theme inline {
  --text-label-large: var(--label-large-font-size);
  --text-label-large--line-height: var(--label-large-line-height);
}
```

This produces a `text-label-large` utility that sets both `font-size` and `line-height`.

### `spacing.css`

Contains spacing tokens (and absolute spacing references).

| Token group | CSS variables | Description |
|---|---|---|
| Border radii | `--rounded-sm`, `--rounded-md`, `--rounded-lg`, … | Figma border radius scale |
| Spacing | `--xs` (0.5rem), `--sm` (0.75rem), `--md` (1rem), `--lg` (1.25rem), `--xl` (1.5rem) | Named spacing tokens |
| Raw spacing | `--spacing-absolute-2`, `--spacing-absolute-4`, … | Underlying values the named tokens reference |

**Wired Tailwind utilities (spacing):** `p-xs`, `p-sm`, `p-md`, `p-lg`, `p-xl` — and all other spacing utilities (`m-`, `gap-`, `mt-`, `px-`, etc.) work with these names too.

---

## 4. Using Tokens in Code

### Colors

```tsx
// Semantic colors — prefer these
<div className="bg-primary text-primary-foreground">...</div>
<p className="text-muted-foreground">...</p>
<div className="border border-border">...</div>

// One-off use of a token not wired to @theme inline
<div className="bg-[var(--unofficial-ghost)]">...</div>
```

### Typography

```tsx
// Wired utilities — use these
<h1 className="text-heading-1 font-semibold">Page title</h1>
<h2 className="text-heading-2 font-semibold">Section title</h2>
<p className="text-paragraph-regular">Body copy</p>
<p className="text-paragraph-small text-muted-foreground">Helper text</p>
<span className="text-caption">Label</span>
```

The `text-*` utilities set `font-size` and `line-height` together. Add `font-semibold`, `font-medium`, or `font-normal` separately for weight.

### Spacing

```tsx
// Token-named spacing
<div className="p-md gap-sm">...</div>
<section className="mt-lg px-xl">...</section>

// Tailwind's built-in numeric scale still works alongside these
<div className="mt-2 p-4">...</div>
```

### Adding a new semantic color end-to-end

Step 1 — define in `styles/colors.css`:

```css
:root { --status-success: oklch(0.72 0.16 150); }
.dark  { --status-success: oklch(0.64 0.14 150); }
```

Step 2 — wire in `app/globals.css`:

```css
@theme inline {
  --color-status-success: var(--status-success);
}
```

Step 3 — use anywhere:

```tsx
<div className="bg-status-success text-white rounded-md px-md py-sm">
  Saved successfully
</div>
```

---

## 5. shadcn Components

### What shadcn is

shadcn/ui is not an npm package. Running `npx shadcn add <component>` generates React + Tailwind source files **directly into this repo**. Those files are our source of truth — edit them freely. There is no shadcn version to update and no upstream to sync with; once generated, the file belongs to us.

### Where generated files land

`components.json` routes shadcn output to:

- **Components**: `common/components/ui/` (e.g. `button.tsx`, `input.tsx`, `pagination.tsx`)
- **Utilities**: `common/lib/utils.ts` (the `cn()` helper — do not move this file)

### Adding a component

```bash
# run from frontend/
npx shadcn@latest add <component-name>
```

The file lands in `common/components/ui/`. Do not rename or move it — shadcn components import each other using these paths, and moving a file breaks those internal references.

### Customising a component

After adding, open the generated file and edit it to match the platform's design — change colors, spacing, variants, default props, anything. The file in the repo is the source of truth, not the shadcn website.

Example: `npx shadcn add pagination` generates `common/components/ui/pagination.tsx`. Open it, change the active page color to the brand primary, adjust margins. Every page that imports `Pagination` now gets the platform version automatically.

### Importing

```tsx
import { Button }     from "@/common/components/ui/button";
import { Pagination } from "@/common/components/ui/pagination";
```

### When to customise where

- **Edit the `ui/` file** for any change that should apply platform-wide (brand colors, sizing defaults, new variants).
- **Pass props at the usage site** (`variant="outline"`, `className="mt-2"`) for a one-off tweak that only applies in one place.
- **Build a composed component** in `common/components/<group>/` when you repeatedly combine multiple `ui/` pieces together (see section below).

---

## 6. Composed Components

`common/components/ui/` holds the atoms — individual shadcn building blocks. The group folders alongside it (`forms/`, `feedback/`, `data-display/`, `layout/`) hold **composed components**: combinations of those atoms reused across multiple flows. You write these yourself; no shadcn involved.

```
common/components/
├── ui/              ← shadcn atoms: Button, Input, Dialog, Label, …
├── forms/           ← FormField, AddressForm, FieldError
├── feedback/        ← ConfirmModal, Toast wrappers
├── data-display/    ← Tables, detail views
└── layout/          ← Page shells
```

**Rule**: build a composed component in `common/components/<group>/` when the same combination of `ui/` pieces appears in more than one flow. If it's only used in one flow, keep it in `app/<flow>/components/` instead.

Each group folder has a `README.md` describing its components — see `forms/README.md` and `multi-step-layout/README.md` for examples.

---

## 7. Walkthrough: From Figma to a Flow

This is a full example connecting every layer: tokens are already wired, we add a shadcn component, customize it for the platform, build a composed component in `common/`, and use it in a flow.

**Scenario:** A consistent form field layout (label + input + error message) used across multiple flows.

---

### Step 1 — Add the shadcn components

```bash
# run from frontend/
npx shadcn@latest add input
npx shadcn@latest add label
```

This generates:
- `common/components/ui/input.tsx`
- `common/components/ui/label.tsx`

---

### Step 2 — Customize them for the platform

Open `common/components/ui/input.tsx`. This is now our platform's Input — edit it freely.

```tsx
// common/components/ui/input.tsx  (after editing)
// Example changes:
//   focus-visible:ring-ring  →  focus-visible:ring-primary   (brand focus color)
//   h-9  →  h-10                                             (taller default)
//   text-sm  →  text-paragraph-small                        (design system text scale)
```

Every `<Input>` in the entire app now uses this updated style automatically.

---

### Step 3 — Build a composed component in common/

Create `FormField` in `common/components/forms/`. It combines `Label` + an input slot + an error message into one reusable unit.

```tsx
// common/components/forms/FormField.tsx
import { Label } from "@/common/components/ui/label";

interface FormFieldProps {
  label: string;
  htmlFor: string;    // must match the id on the input inside children
  error?: string;     // pass undefined when the field is valid
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, htmlFor, error, required, children }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-1 text-destructive" aria-hidden>*</span>}
      </Label>
      {children}
      {error ? (
        <p role="alert" className="text-paragraph-small text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
```

Export from the barrel:

```ts
// common/components/forms/index.ts
export { FormField } from "./FormField";
```

---

### Step 4 — Use it in a flow

```tsx
// app/donate/components/DonationContactForm.tsx
import { FormField } from "@/common/components/forms";
import { Input }     from "@/common/components/ui/input";

export default function DonationContactForm() {
  const [values, setValues] = useState({ first_name: "", email: "" });
  const [errors, setErrors]  = useState<{ first_name?: string; email?: string }>({});

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="First name" htmlFor="first_name" error={errors.first_name} required>
        <Input
          id="first_name"
          value={values.first_name}
          onChange={(e) => setValues({ ...values, first_name: e.target.value })}
          aria-invalid={Boolean(errors.first_name)}
        />
      </FormField>

      <FormField label="Email address" htmlFor="email" error={errors.email} required>
        <Input
          id="email"
          type="email"
          value={values.email}
          onChange={(e) => setValues({ ...values, email: e.target.value })}
          aria-invalid={Boolean(errors.email)}
        />
      </FormField>
    </form>
  );
}
```

---

### What each layer is responsible for

| Layer | File | Responsible for |
|---|---|---|
| Token | `styles/typography.css` | Font size and line height values from Figma |
| shadcn atom | `common/components/ui/input.tsx` | Visual style of every Input platform-wide |
| Composed component | `common/components/forms/FormField.tsx` | Consistent label + input + error layout |
| Flow component | `app/donate/components/DonationContactForm.tsx` | Form state, validation logic, submit handling |

A change to `input.tsx` affects every input everywhere. A change to `FormField` affects every form field in every flow. A change to `DonationContactForm` only affects the donate flow.

---

## 8. Figma Workflow

When a designer updates tokens in Figma:

1. **Export** using the obra-shadcn plugin — this updates one or more of the `styles/*.css` files
2. **Check** whether the changed token is already mapped in `app/globals.css @theme inline`
   - If yes: the Tailwind utility automatically picks up the new value. Done.
   - If no (new token): add a mapping to `@theme inline` following the pattern in section 4
3. **Verify** visually after the change — existing classes that use the token will reflect the new value everywhere they appear

The CSS variable files are the handoff point between design and code. Developers own everything from `globals.css` downstream.
