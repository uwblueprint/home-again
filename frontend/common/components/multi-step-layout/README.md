# MultiStepLayout

This folder is the home for a shared `MultiStepLayout` core component — **not yet built**.

Three flows already use this pattern independently: `IntakeLayout`, `DonationLayout`, and `ReferralLayout`. They share the same visual structure but were built separately. `MultiStepLayout` should unify them.

---

## The Pattern

Every multi-step flow has the same shell:

```
┌─────────────────────────────────────────┐
│  Logo           Step Indicator           │  ← header
├─────────────────────────────────────────┤
│                                         │
│           Step content (children)       │  ← main (scrollable)
│                                         │
├─────────────────────────────────────────┤
│  [Error message]       [Back]  [Next]   │  ← footer (fixed)
└─────────────────────────────────────────┘
```

---

## Design Constraints

**`MultiStepLayout` must be purely presentational.** It owns the visual shell only — it has no opinions about routing, validation, or submission. Each flow's own layout wrapper handles those and passes them in as props.

This separation is what allows three very different flows (router-driven intake, in-memory donation, scaffold referral) to share the same shell without fighting over navigation logic.

---

## Proposed API

```tsx
interface Step {
  label: string;
  path?: string; // optional — router-driven flows use this; in-memory flows don't
}

interface MultiStepLayoutProps {
  steps: Step[];
  currentStep: number;           // 0-indexed
  onNext: () => void | Promise<void>;
  onBack?: () => void;
  nextLabel?: string;            // defaults to "Next", last step defaults to "Submit"
  isNextDisabled?: boolean;
  isSubmitting?: boolean;
  submitError?: string | null;
  leftAction?: React.ReactNode;  // slot for e.g. "+ Add item" alongside Back
  children: React.ReactNode;
}
```

---

## Example Usage (once built)

```tsx
// app/donate/DonationLayout.tsx
export default function DonationLayout({ currentStep, onNext, onBack, children }) {
  return (
    <MultiStepLayout
      steps={DONATION_STEPS}
      currentStep={currentStep - 1}
      onNext={onNext}
      onBack={onBack}
      nextLabel={NEXT_LABELS[currentStep]}
    >
      {children}
    </MultiStepLayout>
  );
}
```

Each flow's `<FlowName>Layout.tsx` becomes a thin wrapper: it defines its steps, wires up its navigation logic, and delegates the shell to `MultiStepLayout`.

---

## Migration Path

The three existing layouts follow the same pattern but were built independently. When implementing `MultiStepLayout`:

1. Build the component here in `multi-step-layout/`
2. Replace `IntakeLayout`, `DonationLayout`, and `ReferralLayout` one at a time — each becomes a thin wrapper
3. Verify each flow end-to-end after migration

The flows' navigation logic, context providers, and validation stay in their own layout files. Only the visual shell moves here.
