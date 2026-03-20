## shadcn/ui in this repo

### What shadcn is
- **Copy-into-repo components**: shadcn/ui is not a component library you import from npm. When you “add” a component, it generates React/Tailwind source files **into this repo**. Those files are now our source of truth.
- **Composable + editable**: you’re expected to edit the generated component code to fit product needs.

### Where the UI lives
- **UI components**: `frontend/components/ui/*`
- **Utilities**: `frontend/lib/utils.ts` (contains `cn()` used by components)
- **Theme wiring entrypoint**: `frontend/app/globals.css`
- **Design tokens**:
  - `frontend/styles/tokens/colors.css`
  - `frontend/styles/tokens/typography.css`
  - `frontend/styles/tokens/radii-spacing.css`
- **Official shadcn component reference**: [https://ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components)

### How to add components
Run from `frontend/`:

```bash
npx shadcn@latest add component-name-here
```

What happens:
- New files are created under `frontend/components/ui/…`
- Dependencies are installed/updated as needed

### How to use components
Import directly from the generated files:

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
```

### Where to edit: component vs. usage
- **Shared behavior/visuals** (used in many places):
  - Edit the **component file** in `frontend/components/ui/*` (e.g., change default padding, variants, or add props).
  - This keeps the design system consistent across the app.
- **One-off behavior/visuals** (specific to a single screen):
  - Keep the shared component as-is.
  - Customize **at the usage site** (for example, pass `variant`, `size`, extra `className`, or wrap it in a small local wrapper component).

In practice:
- **Edit the actual component** for things that should be global defaults or new variants.
- **Edit where it’s imported** for per-page layout or per-instance tweaks.

### Complete usage example
Imagine we have the generated `Button` component and we want a primary action on a page.

```tsx
// app/example/page.tsx
import { Button } from "@/components/ui/button";

export default function ExamplePage() {
  function handleClick() {
    // do something
  }

  return (
    <div className="space-y-4">
      {/* Simple usage */}
      <Button onClick={handleClick}>Save changes</Button>

      {/* Using a variant + custom spacing */}
      <Button variant="outline" className="mt-2">
        Cancel
      </Button>
    </div>
  );
}
```

If you later decide that all primary buttons should be a different height or font weight, you’d:
- Open `frontend/components/ui/button.tsx`
- Adjust the underlying Tailwind classes there
- All usages like the example above will automatically pick up the new design.

### How theme variables work here
The theme is driven by CSS variables, split by token type:
- `frontend/styles/tokens/colors.css` contains semantic/brand/raw color tokens and `.dark` overrides
- `frontend/styles/tokens/typography.css` contains typography tokens
- `frontend/styles/tokens/radii-spacing.css` contains radii + spacing tokens (and font/radius utility variables)

`frontend/app/globals.css` is now the wiring entrypoint only:
- It imports the token files
- It defines `@custom-variant`, `@theme inline`, and `@layer base`

shadcn + Tailwind utilities then reference those variables via Tailwind v4 theme mapping:
- Examples: `bg-background`, `text-foreground`, `border-border`, `ring-ring`

### When to add wiring (and when not to)
- **Add wiring** when you want a token available as a reusable Tailwind utility across the app (for example `bg-status-success`, `text-brand-muted`, `border-critical`).
- **Do not add wiring** when the value is only used in one place; in that case, use the raw CSS variable directly in the component/page className (for example `bg-[var(--status-success)]`).

Rule of thumb:
- If multiple features/screens should use it consistently, wire it in `@theme inline`.
- If it is a one-off screen tweak, use the token directly without new theme mapping.

### Wiring example
Example goal: add a new semantic token for success states and use `bg-status-success` in components.

1) Add the token in `frontend/styles/tokens/colors.css`:

```css
:root {
  --status-success: oklch(0.72 0.16 150);
}

.dark {
  --status-success: oklch(0.64 0.14 150);
}
```

2) Wire it in `frontend/app/globals.css` inside `@theme inline`:

```css
@theme inline {
  /* ...existing mappings... */
  --color-status-success: var(--status-success);
}
```

3) Use it anywhere in UI:

```tsx
<div className="bg-status-success text-white rounded-md px-3 py-2">
  Saved successfully
</div>
```
