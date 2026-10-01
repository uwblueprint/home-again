# Frontend Conventions

This guide is the source of truth for how the Home Again frontend is built. Read it before
adding UI or a new flow. Two rules drive everything here:

1. **Reuse before you build.** Search `common/components` and the [Component Inventory](#component-inventory-figma--code)
   first. Almost every design-system element already exists as a modular component — compose
   those instead of writing new markup or a one-off variant.
2. **New flows mirror existing flows.** The multi-step flows (`agent-intake`, `donate`,
   `referral-form`) share the same structure. A new flow should be recognizable as a sibling
   of these, not a new shape. See [Flow conventions](#flow-conventions).

---

## Tech stack

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4,
[base-ui](https://base-ui.com) + radix-ui primitives,
[`class-variance-authority`](https://cva.style) for variants,
[TanStack Query](https://tanstack.com/query) for server state,
[Zustand](https://zustand.docs.pmnd.rs) for client state,
[MSW](https://mswjs.io) for API mocks, Jest + Testing Library, and `lucide-react` icons.

Scripts (`package.json`):

```bash
npm run dev          # next dev --turbo
npm run type-check   # tsc --noEmit
npm run lint         # eslint .
npm run test         # jest
npm run format       # prettier --write
```

---

## Project layout

```
frontend/
├── app/                      # Next App Router — pages, layouts, and per-flow code
│   ├── <flow>/               # e.g. agent-intake, donate, referral-form
│   │   ├── page.tsx          # entry; "use client"
│   │   ├── layout.tsx        # optional route layout
│   │   ├── components/       # step + presentational components (+ index.ts, types.ts)
│   │   ├── context/          # React context for the flow (validation registration, shared state)
│   │   ├── stores/           # Zustand store(s) scoped to the flow
│   │   └── hooks/            # flow-specific hooks (e.g. useSubmitIntake)
│   ├── globals.css           # Tailwind entry + design-token imports + @theme
│   └── layout.tsx            # root layout + providers
├── common/                   # shared, flow-agnostic code (import via @/common/*)
│   ├── components/
│   │   ├── ui/               # design-system primitives (Button, Dialog, Input, …)
│   │   ├── forms/            # shared form building blocks (see forms/README.md)
│   │   ├── feedback/         # ConfirmModal, ServiceAreaNotice
│   │   ├── data-display/     # ResourceList, ResourceDetail, InformationBlock
│   │   ├── layout/           # PageLayout
│   │   ├── multi-step-layout/  # MultiStepLayout shell (see its README.md)
│   │   ├── file-upload/      # FileUpload dialog
│   │   └── status-labels/    # domain status Badges
│   ├── hooks/                # useApi (TanStack Query), use-mobile, …
│   ├── stores/               # authStore, uiStore (Zustand)
│   ├── constants/            # Routes, validators, config, AuthConstants
│   ├── lib/                  # apiClient (axios), utils (cn)
│   └── types/                # shared TS types
├── styles/                   # design tokens as CSS custom properties
└── mocks/                    # MSW handlers + fixtures
```

Path aliases (`components.json` / `tsconfig.json`): `@/common/components`, `@/common/lib`,
`@/common/hooks`, `@/common/components/ui`, plus `@/app/*`. Always import through the alias,
never with deep relative paths.

---

## Design tokens & styling

**Never hardcode a hex color, px size, font size, radius, or shadow.** Every visual value
comes from a token. Tokens live as CSS custom properties in `styles/` and are imported by
`app/globals.css`:

| File                      | Provides                                                                                                       |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `styles/colors.css`       | semantic colors (`--primary`, `--muted-foreground`, `--destructive`, sidebar tokens, `--unofficial-*` helpers) |
| `styles/typography.css`   | type scale (`text-heading-1…4`, `text-paragraph-*`, `text-caption`)                                            |
| `styles/spacing.css`      | spacing scale (`xs…10xl`) used by `p-*`, `m-*`, `gap-*`, `space-*`                                             |
| `styles/border-radii.css` | radius tokens (`--radius-*`)                                                                                   |
| `styles/shadows.css`      | elevation tokens                                                                                               |
| `styles/alpha.css`        | alpha color primitives the semantic tokens build on                                                            |

`app/globals.css` maps these into Tailwind utilities via `@theme inline` — so use semantic
utilities: `bg-primary`, `text-foreground`, `text-muted-foreground`, `border-border`,
`text-heading-2`, `p-lg`, `gap-md`. Prefer a semantic token (`bg-primary`) over a raw scale
color (`bg-purple-800`).

> **Gotcha — the safelist.** Tailwind only emits utilities it finds as complete strings in
> source. Dynamically built class names (`` `p-${size}` ``) get dropped. The full spacing and
> typography scales are force-generated via `@source inline(...)` in `globals.css`. If you add
> a token utility that isn't picked up, write the class as a complete literal string, or extend
> that safelist — don't construct class names dynamically.

**Class merging:** compose class names with `cn()` from `@/common/lib/utils` (clsx +
tailwind-merge). Never concatenate class strings by hand.

---

## Component inventory (Figma → code)

Every section of the [Home Again Design System](https://www.figma.com/design/UbiTqO5G1WotmW4URVdGwh/Home-Again-Design-System)
maps to code below. **Check here before building any UI.** Import primitives from the barrel
`@/common/components/ui` and composed helpers from their category barrel.

| Figma section                           | Code component(s)                                                                                                                | Notes / status                                                                                                   |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Button                                  | `ui/button.tsx` — `Button`, `buttonVariants`                                                                                     | cva variants: `default/outline/secondary/ghost/destructive/link`; sizes `xs…xl`, `icon*`, `rounded`.             |
| Text inputs / textarea / labels         | `ui/input.tsx`, `ui/textarea.tsx`, `ui/label.tsx`                                                                                | Wrap with `FormField` from the `@/common/components/forms` barrel for label + error layout.                      |
| Dropdown / Select                       | `ui/select.tsx`, `ui/dropdown-menu.tsx`, `forms/SelectAndCombo.tsx`                                                              |                                                                                                                  |
| Checkbox / Radio                        | `ui/checkbox.tsx`, `ui/radio-group.tsx`                                                                                          |                                                                                                                  |
| Upload                                  | `file-upload/FileUpload.tsx`                                                                                                     | Controlled modal upload; parent owns open state + file list.                                                     |
| Status Pills / Badges                   | `ui/badge.tsx`; domain badges in `status-labels/donation-status-labels.tsx`                                                      | Referral/client/item/pickup/donation status render as preset `Badge`s. Add new domain statuses here, not inline. |
| Priority / Tag variants                 | `ui/badge.tsx`                                                                                                                   |                                                                                                                  |
| Filter & search / Sort dropdowns        | `ui/sort-menu.tsx`, `ui/dropdown-menu.tsx`                                                                                       |                                                                                                                  |
| Tables                                  | `ui/table.tsx`; composed `data-display/data-table/*` — `DataTable`, `DataTableColumnHeader`, `DataTableFacetedFilter`, `DataTableToolbar`, `DataTablePagination` | See `data-table/README.md` for usage. Sortable headers toggle asc/desc directly on click (no dropdown, no column hiding). Row-nav chevron shows when `onRowClick` is passed. |
| Calendar / Date & time picker           | **Gap** — no shared component yet                                                                                                | Build shared when first needed; do not hardcode a one-off.                                                       |
| Pagination                              | **Gap** — no shared component yet (Figma refs shadcn Pagination)                                                                 | Build `ui/pagination.tsx` when needed.                                                                           |
| Headers                                 | `forms/Header.tsx`, `forms/Footer.tsx`                                                                                           |                                                                                                                  |
| Sidebar                                 | `ui/sidebar.tsx`, `ui/admin-sidebar.tsx`, `ui/agent-sidebar.tsx`, `ui/sidebar-app-shell.tsx`, `ui/sidebar-nav-shell.tsx`         | Use the app/nav shells; don't rebuild sidebar chrome.                                                            |
| Tabs / Furniture category tabs / Subtabs | `ui/tabs.tsx`, `ui/furniture-category-tabs.tsx`, `ui/subtabs.tsx`                                                                | `SubTabs` is the segmented pill filter bar (Figma main file, node 4557:24208) — a view-level element composed above a list/table, not built into `DataTable`. Optional; the caller decides whether to render it. |
| Big toggle buttons                      | `ui/button.tsx` (toggle styling) / flow components                                                                               |                                                                                                                  |
| Form breadcrumb / Step indicator        | `forms/FormBreadcrumb.tsx`, `ui/breadcrumb.tsx`, `ui/step-indicator.tsx`                                                         | Used by `MultiStepLayout`.                                                                                       |
| Donation-request cards                  | `app/donation-request/components/*`, `forms/FurnitureItemCard.tsx`, `ui/card.tsx`                                                |                                                                                                                  |
| Dialogs                                 | `ui/dialog.tsx` — `Dialog`, `DialogContent`, `DialogHeader`, `DialogBody`, `DialogFooter`, `DialogTitle`, `DialogDescription`, … |                                                                                                                  |
| Overlays / Sheets                       | `ui/sheet.tsx`, `ui/dialog.tsx`                                                                                                  |                                                                                                                  |
| Alerts                                  | `feedback/ConfirmModal.tsx`, `feedback/ServiceAreaNotice.tsx`                                                                    |                                                                                                                  |
| Cards (information, page content)       | `ui/card.tsx`, `data-display/InformationBlock.tsx`                                                                               |                                                                                                                  |
| Avatar / Tooltip / Separator / Skeleton | `ui/avatar.tsx`, `ui/tooltip.tsx`, `ui/separator.tsx`, `ui/skeleton.tsx`                                                         |                                                                                                                  |
| Icons                                   | `lucide-react` — e.g. `import { XIcon } from "lucide-react"`                                                                     | Use a lucide icon rather than pasting inline `<svg>` markup. Exception: brand art like `/hafb_logo.svg`.         |

If a design calls for something marked **Gap**, build it as a _shared_ component in the right
`common/components` category (with a barrel export) rather than inlining it in a page — that is
how the inventory stays complete.

---

## Component authoring conventions

Follow the pattern in `ui/button.tsx` when creating or extending a primitive:

- **`cva` for variants.** Define a `cva(base, { variants, defaultVariants })` and export both
  the component and its `*Variants` function. Merge in caller `className` via
  `cn(fooVariants({ variant, size, className }))`.
- **`data-slot` attribute.** Each primitive sets `data-slot="<name>"` so styles and parents can
  target parts without brittle selectors.
- **Base primitive.** Prefer wrapping a base-ui / radix primitive (e.g.
  `@base-ui/react/button`) rather than raw DOM, to inherit accessibility.
- **`"use client"`** at the top of any component using state, effects, refs, or event handlers.
  Keep it off components that can stay server components.
- **Barrel exports.** Every category folder has an `index.ts` re-exporting its public API
  (`ui/index.ts`, `forms/index.ts`, …). Add new components to the barrel and import through it.
- **React imports.** Import only the names you need (`import { useState } from "react"`).
  **Never `import * as React`.**
- **Icons come from `lucide-react`,** not hand-written `<svg>` markup — see `ui/dialog.tsx`'s
  `XIcon`. They inherit `currentColor` and take a token size utility (`size-4`), so they pick up
  `text-muted-foreground` and friends for free. A few older spots still inline SVG paths
  (`ui/step-indicator.tsx`, `data-display/ResourceList.tsx`, `donate/components/StepDonationSummary.tsx`);
  replace those with lucide equivalents when you touch them. Only genuine brand art (the
  `/hafb_logo.svg` wordmark) stays a static asset.
- **Folder-per-category.** Put a new shared component in the category that matches its role
  (`ui` = design-system primitive, `forms` = form block, `feedback` = alerts/modals, etc.).
  Colocate its test as `Component.test.tsx`.

---

## Flow conventions

A "flow" is a user journey under `app/<flow>/`. The three existing multi-step flows share one
structure — replicate it:

```
app/<flow>/
├── page.tsx            # "use client"; owns navigation, validation orchestration, submit
├── layout.tsx          # optional; wraps children in the flow's providers
├── components/
│   ├── index.ts        # barrel: re-export every step + its types/validators/empty-defaults
│   ├── types.ts        # shared form-data types for the flow
│   └── <Step>.tsx      # one component per step (presentational)
├── context/            # e.g. IntakeContext — steps register a validateStep() callback
├── stores/             # Zustand store for the flow's form data (see intakeFormStore.ts)
└── hooks/              # e.g. useSubmitIntake
```

Key rules, learned from the existing flows:

- **Use `MultiStepLayout` for the shell.** Multi-step flows render steps through
  `@/common/components/multi-step-layout` (`MultiStepLayout` + `Step`). The shell owns the
  header, step indicator, and Back/Next footer — **it owns no flow logic**. The flow passes
  `steps`, `currentStep`, `onNext`, `onBack`, `nextLabel`, etc. as props. See
  `app/referral-form/page.tsx` for a live example and `multi-step-layout/README.md` for the
  full contract.
- **Validation lives in the page/context, not in components.** Steps are presentational: they
  render fields and display `errors` passed as props. The `validate*()` functions and error
  messages live alongside the step in `components/` and are orchestrated from `page.tsx`. Steps
  register a `validateStep` callback with the flow context (see `agent-intake/context/IntakeContext.tsx`)
  so the layout can block "Next" on invalid input.
- **Reuse validator regexes.** Import from `@/common/constants/validators` (`EMAIL_REGEX`,
  `PHONE_REGEX`, `POSTAL_CODE_REGEX`, `AGENCY_URL_HOST_REGEX`, `formatReviewPhoneNumber`) —
  never inline a regex.
- **Forms.** Use the shared building blocks in `common/components/forms` (see
  `forms/README.md`). Form components are presentational; they receive `values`, `errors`,
  `onChange`, `onBlur` and render — they do not own validation state.
- **Navigation.** Use route constants from `@/common/constants/Routes` — don't hardcode URL
  strings.
- **Barrel-first imports.** A page imports its steps from `@/app/<flow>/components`, not from
  individual files.

---

## Data layer

- **Server state → TanStack Query.** Data fetching goes through the hooks in
  `common/hooks/useApi.ts` (`useQuery` for GETs, `useMutation` for writes, with cache
  invalidation). Don't call `apiClient` directly from components — add or reuse a hook.
- **HTTP client.** `common/lib/apiClient.ts` is a shared axios instance with auth-token and
  401 interceptors and `NEXT_PUBLIC_API_URL` base. Use it inside `useApi` hooks.
- **Client state → Zustand.** App-wide state lives in `common/stores` (`authStore`, `uiStore`);
  flow-scoped form state lives in that flow's `stores/`. Keep derived server state out of
  Zustand — that's Query's job.
- **Types.** Shared API/domain types live in `common/types`; flow-local form types in the
  flow's `components/types.ts`.
- **Mocks.** MSW handlers and fixtures live in `mocks/` (one file per resource). Add a fixture
  - handler when introducing a new endpoint so the UI is developable without the backend.

---

## Testing, lint & format

- **Colocate tests** as `Component.test.tsx` next to the component (see
  `ConfirmModal.test.tsx`, `FileUpload.test.tsx`, `MultiStepLayout.test.tsx`). Use Testing
  Library; assert behavior, not implementation.
- **After any logic change**, run `npm run type-check`, `npm run lint`, and `npm run test`.
  If a change has no tests covering it, say so.
- **Formatting** is Prettier-enforced (`.prettierrc`: semicolons, es5 trailing commas, double
  quotes, printWidth 80, 2-space tabs) — run `npm run format`. ESLint extends
  `next/core-web-vitals` + `next/typescript`; avoid `any` (warns) and prefix intentionally
  unused vars with `_`.

---

## Further reading

- `common/components/forms/README.md` — shared form building blocks (`FormField`, `FieldError`,
  `AddressForm`, `FileUpload`) and the presentational-forms rule.
- `common/components/multi-step-layout/README.md` — the `MultiStepLayout` shell contract and how
  to migrate a flow onto it.
- `common/components/data-display/data-table/README.md` — `DataTable` usage: sortable headers,
  filters, subtabs, row-click navigation, loading/error/empty states.
