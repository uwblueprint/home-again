# Frontend Guide

This guide covers architecture, conventions, and patterns for the Home Again frontend (`frontend/`).

---

## 1. Directory Structure

```
frontend/
├── app/                          # Next.js routes + co-located page code
│   ├── globals.css               # Wiring entrypoint — imports common/styles/
│   ├── layout.tsx
│   ├── page.tsx
│   │
│   └── <flow-name>/              # One directory per flow
│       ├── layout.tsx            # (if the flow needs a shared shell)
│       ├── <FlowName>Layout.tsx  # Flow layout component
│       ├── page.tsx
│       ├── [param]/page.tsx      # (dynamic route segments as needed)
│       ├── components/           # Flow-specific components
│       │   └── index.ts
│       ├── context/              # Shared local state across steps
│       │   └── index.ts
│       ├── hooks/                # Data-fetching / submit logic
│       │   └── index.ts
│       └── stores/               # Zustand (cross-route navigation state)
│
└── common/                       # Everything shared across ≥2 pages
    ├── components/
    │   ├── ui/                   # shadcn-generated components (run `npx shadcn add`)
    │   ├── layout/               # Page-level layout shells
    │   ├── data-display/         # Tables, detail views
    │   ├── feedback/             # Modals, toasts
    │   ├── forms/                # Core form components
    │   └── multi-step-layout/    # Core multi-step shell
    ├── styles/                   # Design token CSS
    │   ├── colors.css
    │   ├── typography.css
    │   └── spacing.css
    ├── hooks/                    # TanStack Query hooks
    ├── lib/                      # apiClient, utils (cn)
    ├── stores/                   # Global Zustand stores (auth, UI)
    ├── types/                    # domain.ts, api.ts, props.ts
    ├── constants/                # Routes, validators, config
    └── utils/                    # Date, CSV, localStorage helpers
```

**Key rules:**

- `app/` is routes + co-located page code. Next.js only treats `page.tsx`, `layout.tsx`, `loading.tsx`, etc. as routes — all other files and folders inside `app/` are ignored by the router.
- `common/` is everything shared across two or more pages. If code is only used in one flow, it stays in `app/<flow>/`.
- Config files stay at the root.

---

## 2. The Core / Variant Component Model

This is the central architectural rule.

**Core components** live in `common/components/<group>/`. They are the generic, reusable building blocks.

**Variant components** live in `app/<flow>/components/` and extend or wrap the core for a specific flow. They are named `<FlowPrefix><CoreName>`:

```
common/components/forms/AddressForm.tsx             ← core
app/donate/components/DonationAddressForm.tsx        ← donate variant
app/referral-form/components/ReferralAddressForm.tsx ← referral variant
```

**Rules:**

- Start in the flow. If a second flow needs the same component, extract the shared parts to `common/components/` first, then create variants in both flows.
- If a component will never be shared, no core counterpart is needed. Keep it in `app/<flow>/components/` with no prefix.

---

## 3. shadcn

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

### Design tokens and theme wiring

Token files live in `common/styles/`:

- `colors.css` — semantic, brand, and raw color tokens; `.dark` overrides
- `typography.css` — font families, heading and body scale
- `spacing.css` — radii and spacing tokens

`app/globals.css` is the wiring entrypoint only — it imports the three token files and maps them into Tailwind via `@theme inline`. shadcn utilities reference those mappings: `bg-background`, `text-foreground`, `border-border`, etc.

**When to wire a new token:**

- Add a `@theme inline` mapping when the token should be available as a Tailwind utility across the whole app (e.g. `bg-status-success`).
- Use the raw CSS variable directly (`bg-[var(--status-success)]`) when the token is only used in one place.

**Adding a new semantic token end-to-end:**

Step 1 — define in `common/styles/colors.css`:

```css
:root { --status-success: oklch(0.72 0.16 150); }
.dark { --status-success: oklch(0.64 0.14 150); }
```

Step 2 — wire in `app/globals.css`:

```css
@theme inline {
  --color-status-success: var(--status-success);
}
```

Step 3 — use anywhere:

```tsx
<div className="bg-status-success text-white rounded-md px-3 py-2">
  Saved successfully
</div>
```

---

## 4. Composed Components in common/

`common/components/ui/` holds the atoms — individual building blocks from shadcn. The group folders alongside it (`forms/`, `feedback/`, `data-display/`, `layout/`) are for **composed components**: combinations of those atoms that are reused across multiple flows.

A composed component is just a regular React component that imports from `ui/` and arranges pieces into a reusable pattern. You write it yourself (no shadcn involved).

Example — `FormField` composes `Label` + `Input` + error display into one thing that every form field needs:

```tsx
// common/components/forms/FormField.tsx
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-destructive text-sm" role="alert">{error}</p> : null}
    </div>
  );
}
```

Example — `ConfirmModal` composes `Dialog` + two `Button`s into the standard confirmation pattern:

```tsx
// common/components/feedback/ConfirmModal.tsx
import { Button } from "@/common/components/ui/button";
import { Dialog, DialogContent, ... } from "@/common/components/ui/dialog";
```

**Rule:** build a composed component in `common/components/<group>/` when the same combination of `ui/` pieces appears in more than one flow. If it's only used in one flow, keep it in `app/<flow>/components/` instead.

---

## 5. Walkthrough: From shadcn to a Flow

This is a full example connecting every layer: adding a shadcn component, customizing it for the platform, building a composed component in `common/`, and using it inside a flow.

**Scenario:** We want a consistent form field layout (label + input + error message) used across multiple flows.

---

### Step 1 — Add the shadcn components

```bash
# run from frontend/
npx shadcn@latest add input
npx shadcn@latest add label
```

This generates two files:
- `common/components/ui/input.tsx`
- `common/components/ui/label.tsx`

---

### Step 2 — Customize them for the platform

Open `common/components/ui/input.tsx`. This is our platform's Input — edit it freely. For example, update the focus ring to use the brand primary color and adjust the default height:

```tsx
// common/components/ui/input.tsx  (after editing)
// Find the className string and change:
//   focus-visible:ring-ring  →  focus-visible:ring-primary
//   h-9  →  h-10
// The exact class names depend on what shadcn generated.
```

Every `<Input>` in the entire app now uses this updated style automatically. No other files need to change.

---

### Step 3 — Build a composed component in common/

Now create `FormField` in `common/components/forms/`. This is a composed component — it combines `Label` + the input slot + an error message into one reusable unit.

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
        <p role="alert" className="text-sm text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
```

Export it from the barrel:

```ts
// common/components/forms/index.ts
export { FormField } from "./FormField";
```

---

### Step 4 — Use it in a flow

Now use `FormField` inside a flow's component. The flow provides its own form state and validation — `FormField` only handles the display.

```tsx
// app/donate/components/DonationContactForm.tsx
import { FormField } from "@/common/components/forms/FormField";
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
| shadcn atom | `common/components/ui/input.tsx` | Visual style of every Input platform-wide |
| Composed component | `common/components/forms/FormField.tsx` | Consistent label + input + error layout |
| Flow component | `app/donate/components/DonationContactForm.tsx` | Form state, validation logic, submit handling |

A change to `input.tsx` affects every input everywhere. A change to `FormField` affects every form field in every flow. A change to `DonationContactForm` only affects the donate flow. This layering is what makes the codebase easy to maintain.

---

## 6. Adding a New Page or Flow

1. Create `app/<flow-name>/` with only the subdirectories you actually need:

```
app/new-flow/
├── layout.tsx          (if the flow needs a shared shell)
├── page.tsx
├── components/
│   └── index.ts
├── context/            (only if there's shared local state across steps)
│   └── index.ts
├── hooks/              (only if there's custom data-fetching or submit logic)
│   └── index.ts
└── stores/             (only if state must survive Next.js route navigation)
```

2. Add route path constants to `common/constants/Routes.ts`.
3. If any component will be shared with another flow, move it to `common/components/<group>/` and create a variant in the flow if needed.

---

## 7. common/ vs app/ Decision Rule


| Situation                                     | Where it lives                                      |
| --------------------------------------------- | --------------------------------------------------- |
| Used in ≥ 2 flows                             | `common/`                                           |
| Used in 1 flow only                           | `app/<flow>/`                                       |
| Not sure yet — only 1 use so far              | `app/<flow>/` — promote when the second use appears |
| Cross-route Zustand state for a specific flow | `app/<flow>/stores/`                                |
| Global auth / UI state                        | `common/stores/`                                    |


---

## 8. Validation

Never define inline regex for standard formats. Import from `common/constants/validators.ts`:

```ts
import { EMAIL_REGEX, PHONE_REGEX, POSTAL_CODE_REGEX } from "@/common/constants/validators";

if (!EMAIL_REGEX.test(value)) { setError("Invalid email"); }
```

To add a new shared pattern, add it to `validators.ts` — do not scatter it across files.

---

## 9. State Management


| Need                                                  | Tool                                        |
| ----------------------------------------------------- | ------------------------------------------- |
| Server data (lists, records)                          | TanStack Query via `common/hooks/useApi.ts` |
| Within-flow form state (dies when component unmounts) | React context in `app/<flow>/context/`      |
| Cross-route state (survives Next.js navigation)       | Zustand in `app/<flow>/stores/`             |
| Global app state (auth, UI preferences)               | Zustand in `common/stores/`                 |


Do not use Zustand for state that only lives within a single page render — React context or `useState` is correct there. The intake flow's `intakeFormStore` uses Zustand specifically because the form must survive navigation between `/agent-intake/agency`, `/agent-intake/main-agent`, etc.

---

## 10. Types

`common/types/` has three files — import via the barrel:

```ts
import type { AgencyRecord, Donor } from "@/common/types";
```

- `domain.ts` — entity shapes mirroring the FastAPI backend schemas. Update when the API schema changes.
- `api.ts` — mutation payload types (one per API mutation: `CreateAgencyInput`, `UpdateAgencyInput`, etc.).
- `props.ts` — shared component prop interfaces for components in `common/components/`.

Flow-specific types (form values, error shapes, local state interfaces) stay inside the flow's `context/` or `components/` file. Do not add them to `common/types/`.

---

## 11. Barrel Exports

Every `components/`, `context/`, and `hooks/` directory has an `index.ts`. Use explicit named re-exports — never `export *`:

```ts
// app/agent-intake/components/index.ts
export { AgentCard }          from "./AgentCard";
export { IntakeStepPage }     from "./IntakeStepPage";
export type { AgentCardProps } from "./AgentCard";
```

Feature internals (e.g. `StepFurnitureDetails` importing `FurnitureItemCard`) import from sibling files directly. Code outside the flow imports from the feature's barrel `index.ts`.