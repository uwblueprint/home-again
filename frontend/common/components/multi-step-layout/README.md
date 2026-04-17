# MultiStepLayout

This folder holds a shared layout shell for multi-step flows — **not yet built**.

Three flows already use this pattern independently: `IntakeLayout`, `DonationLayout`, and `ReferralLayout`. They look the same and are structured the same, but were built separately. `MultiStepLayout` should give them a single shared shell so changes to the layout (the header, step indicator, footer buttons) only need to happen in one place.

> **Not yet built.** The existing flow layouts work fine as-is. This component should be created when the visual inconsistencies between the three layouts become a maintenance problem, or when a new flow needs to be added.

---

## What the pattern looks like

Every multi-step flow has the same visual structure:

```
┌──────────────────────────────────────────────┐
│  Logo              [Step 1] [Step 2] [Step 3] │  ← header (fixed at top)
├──────────────────────────────────────────────┤
│                                              │
│              Step content here              │  ← scrollable main area
│                                              │
├──────────────────────────────────────────────┤
│  [Error message]          [Back]    [Next →] │  ← footer (fixed at bottom)
└──────────────────────────────────────────────┘
```

The header shows the logo and a step indicator. The footer has Back and Next/Submit buttons, and optionally an error message or extra action on the left side (like "+ Add item" in the donation flow).

---

## The key design rule: layout owns the shell, not the logic

`MultiStepLayout` should be a **display-only component**. It renders the header, footer, and step indicator — nothing more. It should have no idea what "Next" means for a given flow.

Each flow's own layout wrapper handles:
- What happens when the user clicks Next (validate the form, push to next route, increment a counter, etc.)
- Whether the Next button should be disabled
- What the Next button label says ("Next", "Submit", "Continue to Summary", etc.)
- Which context providers wrap the content

The flow's layout then passes all of that down to `MultiStepLayout` as props. This way, three very different navigation models (router-based, in-memory counter, breadcrumb-driven) can all use the same visual shell.

---

## Proposed props

```tsx
interface Step {
  label: string;
  path?: string;
  // path is optional — router-driven flows (like agent-intake) use it to
  // highlight the active step based on the URL. In-memory flows (like donate)
  // just pass a currentStep number and don't need paths.
}

interface MultiStepLayoutProps {
  // Step indicator
  steps: Step[];
  currentStep: number;         // 0-indexed (step 1 = 0, step 2 = 1, ...)

  // Footer buttons
  onNext: () => void | Promise<void>;
  onBack?: () => void;         // omit to hide the Back button on the first step
  nextLabel?: string;          // e.g. "Continue to Summary", "Submit" — defaults to "Next"
  isNextDisabled?: boolean;    // use to block Next while async work is in progress
  isSubmitting?: boolean;      // shows a loading state on the Next button

  // Footer extras
  submitError?: string | null; // error message shown above the footer buttons
  leftAction?: React.ReactNode; // e.g. an "+ Add item" button next to Back

  children: React.ReactNode;   // the step's content
}
```

---

## What it looks like once built

Each existing flow layout becomes a thin wrapper that handles its own navigation and passes the shell config down:

```tsx
// app/donate/DonationLayout.tsx — after migration
import { MultiStepLayout } from "@/common/components/multi-step-layout";

const STEPS = [
  { label: "Furniture Details" },
  { label: "Schedule a Pickup" },
  { label: "Donation Summary" },
];

const NEXT_LABELS: Record<number, string> = {
  0: "Schedule Pickup",
  1: "Continue to Summary",
  2: "Submit Request",
};

export default function DonationLayout({ currentStep, onNext, onBack, children }) {
  return (
    <MultiStepLayout
      steps={STEPS}
      currentStep={currentStep - 1}  // DonationLayout uses 1-indexed steps internally
      onNext={onNext}
      onBack={onBack}
      nextLabel={NEXT_LABELS[currentStep - 1]}
    >
      {children}
    </MultiStepLayout>
  );
}
```

The flow's navigation logic, context providers, and validation stay exactly where they are. Only the HTML structure moves into `MultiStepLayout`.

---

## How to build it

1. Create `MultiStepLayout.tsx` in this folder
2. Copy the HTML structure from `IntakeLayout.tsx` as the starting point (it's the most complete version)
3. Replace all hardcoded step names, routes, and button labels with props
4. Export from `index.ts`:
   ```ts
   export { MultiStepLayout } from "./MultiStepLayout";
   export type { MultiStepLayoutProps, Step } from "./MultiStepLayout";
   ```
5. Migrate one flow layout at a time, verifying end-to-end after each one

---

## Reference: the three existing layouts

| File | How navigation works | Steps |
|---|---|---|
| `app/agent-intake/IntakeLayout.tsx` | Router-based — reads `usePathname()` to find the current step, calls `router.push()` to advance | Agency → Your Details → Other Agents → Review |
| `app/donate/DonationLayout.tsx` | In-memory — `currentStep` is a prop passed from the parent page component | Furniture Details → Schedule a Pickup → Donation Summary |
| `app/referral-form/ReferralLayout.tsx` | Router-based with breadcrumbs | Variable |

Look at these files for reference when building `MultiStepLayout`. The `IntakeLayout` version is the most feature-complete (it handles disabled states, async submission, and a custom "Maybe later" label on one step).
