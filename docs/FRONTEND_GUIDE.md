# Frontend Guide

This guide covers architecture, conventions, and patterns for the Home Again frontend (`frontend/`).

For how to use the design system, Figma tokens, and shadcn components, see [DESIGN_SYSTEM_GUIDE.md](./DESIGN_SYSTEM_GUIDE.md).

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

## 3. Adding a New Page or Flow

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

## 4. common/ vs app/ Decision Rule


| Situation                                     | Where it lives                                      |
| --------------------------------------------- | --------------------------------------------------- |
| Used in ≥ 2 flows                             | `common/`                                           |
| Used in 1 flow only                           | `app/<flow>/`                                       |
| Not sure yet — only 1 use so far              | `app/<flow>/` — promote when the second use appears |
| Cross-route Zustand state for a specific flow | `app/<flow>/stores/`                                |
| Global auth / UI state                        | `common/stores/`                                    |


---

## 5. Validation

Never define inline regex for standard formats. Import from `common/constants/validators.ts`:

```ts
import { EMAIL_REGEX, PHONE_REGEX, POSTAL_CODE_REGEX } from "@/common/constants/validators";

if (!EMAIL_REGEX.test(value)) { setError("Invalid email"); }
```

To add a new shared pattern, add it to `validators.ts` — do not scatter it across files.

---

## 6. State Management


| Need                                                  | Tool                                        |
| ----------------------------------------------------- | ------------------------------------------- |
| Server data (lists, records)                          | TanStack Query via `common/hooks/useApi.ts` |
| Within-flow form state (dies when component unmounts) | React context in `app/<flow>/context/`      |
| Cross-route state (survives Next.js navigation)       | Zustand in `app/<flow>/stores/`             |
| Global app state (auth, UI preferences)               | Zustand in `common/stores/`                 |


Do not use Zustand for state that only lives within a single page render — React context or `useState` is correct there. The intake flow's `intakeFormStore` uses Zustand specifically because the form must survive navigation between `/agent-intake/agency`, `/agent-intake/main-agent`, etc.

---

## 7. Types

`common/types/` has three files — import via the barrel:

```ts
import type { AgencyRecord, Donor } from "@/common/types";
```

- `domain.ts` — entity shapes mirroring the FastAPI backend schemas. Update when the API schema changes.
- `api.ts` — mutation payload types (one per API mutation: `CreateAgencyInput`, `UpdateAgencyInput`, etc.).
- `props.ts` — shared component prop interfaces for components in `common/components/`.

Flow-specific types (form values, error shapes, local state interfaces) stay inside the flow's `context/` or `components/` file. Do not add them to `common/types/`.

---

## 8. Barrel Exports

Every `components/`, `context/`, and `hooks/` directory has an `index.ts`. Use explicit named re-exports — never `export *`:

```ts
// app/agent-intake/components/index.ts
export { AgentCard }          from "./AgentCard";
export { IntakeStepPage }     from "./IntakeStepPage";
export type { AgentCardProps } from "./AgentCard";
```

Feature internals (e.g. `StepFurnitureDetails` importing `FurnitureItemCard`) import from sibling files directly. Code outside the flow imports from the feature's barrel `index.ts`.