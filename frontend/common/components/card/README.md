# Card

A modular container card from the Home Again design system
([Figma](https://www.figma.com/design/UbiTqO5G1WotmW4URVdGwh/Home-Again-Design-System?node-id=696-3888)).

The Figma component is a single card with several toggleable parts — a
collapsible title bar, a main heading, content slots, and an action footer.
Instead of one component with many boolean props, those parts are exported as
composable subcomponents so each use case assembles exactly the pieces it needs.

> Looking for the low-level shadcn primitive? That still lives in
> `common/components/ui/card`. This folder is the higher-level, design-system
> card used for page content panels and collapsible item cards.

## Parts

| Component                | Purpose                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------- |
| `Card`                   | The surface: white background, border, soft shadow, padding, `gap-lg` between children. Pass `gap="none"` for a collapsible card |
| `CardCollapseHeader`     | Muted "Title + Badge + chevron" bar. Pass `onToggle` to make it an accordion trigger   |
| `CardHeading`            | Main heading row (heading 4). Optional `action` slot on the right                       |
| `CardCollapsibleContent` | Animated body for collapsible cards (grid-rows transition)                              |
| `CardFooter`             | Right-aligned action row — drop `<Button />`s in                                        |

### `CardCollapseHeader` props

| Prop       | Type                | Default | Notes                                                  |
| ---------- | ------------------- | ------- | ------------------------------------------------------ |
| `title`    | `ReactNode`         | —       | Required. Muted title text                             |
| `badge`    | `ReactNode`         | —       | Rendered next to the title (e.g. a `<Badge />`)        |
| `open`     | `boolean`           | —       | Drives the chevron direction and `aria-expanded`       |
| `onToggle` | `() => void`        | —       | When set, the bar renders as an interactive button     |
| `showIcon` | `boolean`           | `true`  | Hide the trailing icon                                 |
| `icon`     | `ReactNode`         | chevron | Override the trailing icon                             |

### `CardCollapsibleContent` props

| Prop   | Type      | Notes                          |
| ------ | --------- | ------------------------------ |
| `open` | `boolean` | Whether the body is expanded   |

## Usage

```tsx
import {
  Card,
  CardCollapseHeader,
  CardHeading,
  CardCollapsibleContent,
  CardFooter,
} from "@/common/components/card";
```

### Information panel

```tsx
<Card>
  <CardHeading>Client Information</CardHeading>
  {/* …content… */}
</Card>
```

### Form card

```tsx
<Card>
  {/* …form fields… */}
  <CardFooter>
    <Button variant="secondary">Cancel</Button>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

### Collapsible item (accordion)

Pass `gap="none"` to the `Card` so it collapses flush to the header;
`CardCollapsibleContent` supplies its own spacing when open.

```tsx
function Item() {
  const [open, setOpen] = useState(true);

  return (
    <Card gap="none">
      <CardCollapseHeader
        title="Item 1"
        badge={<Badge variant="outline">Badge</Badge>}
        open={open}
        onToggle={() => setOpen((v) => !v)}
      />
      <CardCollapsibleContent open={open}>
        <CardHeading>Item Details</CardHeading>
        {/* …content… */}
        <CardFooter>
          <Button variant="secondary">Cancel</Button>
          <Button>Save</Button>
        </CardFooter>
      </CardCollapsibleContent>
    </Card>
  );
}
```

### Collapsed / standalone header

Omit `onToggle` for a static, non-interactive bar.

```tsx
<CardCollapseHeader title="Title 1" badge={<Badge variant="outline">Badge</Badge>} />
```
