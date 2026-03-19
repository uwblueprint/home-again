## shadcn/ui in this repo

### What shadcn is
- **Copy-into-repo components**: shadcn/ui is not a component library you import from npm. When you “add” a component, it generates React/Tailwind source files **into this repo**. Those files are now our source of truth.
- **Composable + editable**: you’re expected to edit the generated component code to fit product needs.

### Where the UI lives
- **UI components**: `frontend/components/ui/*`
- **Utilities**: `frontend/lib/utils.ts` (contains `cn()` used by components)
- **Theme tokens**: `frontend/app/globals.css`

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
The theme is driven by CSS variables, set in `frontend/app/globals.css`:
- **Light theme** tokens are in `:root { … }`
- **Dark theme** tokens are in `.dark { … }`

shadcn + Tailwind utilities then reference those variables via Tailwind v4 theme mapping:
- Examples: `bg-background`, `text-foreground`, `border-border`, `ring-ring`

