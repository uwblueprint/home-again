"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Plus,
  Search,
  SquarePen,
  Trash2,
} from "lucide-react";
import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/common/components/ui";
import { SelectAndCombo, FurnitureItemCard } from "@/common/components/forms";

// ─── section / row helpers ────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-md">
      <h2 className="text-heading-4 font-semibold border-b border-border pb-sm">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ComponentRow({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-sm rounded-md border border-border bg-card p-md md:flex-row md:items-center md:justify-between md:gap-md">
      <div className="w-full md:w-auto">{children}</div>
      <code className="text-caption font-medium bg-muted text-muted-foreground px-xs py-[2px] rounded-sm border border-border w-fit md:ml-auto shrink-0">
        {name}
      </code>
    </div>
  );
}

// ─── base component demos ─────────────────────────────────────────────────────

function BadgeDemo() {
  return <Badge variant="outline">Sample badge</Badge>;
}

function BreadcrumbDemo() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Components</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

type DemoButtonSize = "default" | "sm" | "xs";

const BUTTON_DEMO_COLUMNS: {
  title: string;
  size: DemoButtonSize;
  rounded?: boolean;
  editLabel: string;
}[] = [
  { title: "Regular Size", size: "default", editLabel: "Edit" },
  { title: "Small Size", size: "sm", editLabel: "Edit" },
  { title: "Mini Size", size: "xs", editLabel: "Label" },
  { title: "Round", size: "default", rounded: true, editLabel: "Edit" },
];

function ButtonDemo() {
  return (
    <div className="w-full p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {BUTTON_DEMO_COLUMNS.map(({ title, size, rounded = false, editLabel }) => {
          const iconSize = size === "xs" ? "size-3" : "size-4";

          return (
            <div key={title} className="space-y-3">
              <h3 className="text-lg font-semibold text-muted-foreground">
                {title}
              </h3>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button size={size} rounded={rounded}>
                    Login with Email
                  </Button>
                  <Button size={size} rounded={rounded}>
                    <Plus className={iconSize} data-icon="inline-start" />
                    Add item
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size={size} rounded={rounded}>
                    <SquarePen className={iconSize} data-icon="inline-start" />
                    {editLabel}
                  </Button>
                  <Button variant="outline" size={size} rounded={rounded}>
                    <Plus className={iconSize} data-icon="inline-start" />
                    Add
                  </Button>
                  <Button
                    variant="destructive"
                    size={size}
                    rounded={rounded}
                  >
                    <Trash2 className={iconSize} data-icon="inline-start" />
                    Delete
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size={size} rounded={rounded}>
                    Dropdown
                    <ChevronDown className={iconSize} data-icon="inline-end" />
                  </Button>
                  <Button variant="secondary" size={size} rounded={rounded}>
                    Dropup
                    <ChevronUp className={iconSize} data-icon="inline-end" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size={size} rounded={rounded}>
                    <ArrowLeft className={iconSize} data-icon="inline-start" />
                    Previous
                  </Button>
                  <Button variant="secondary" size={size} rounded={rounded}>
                    Next
                    <ArrowRight className={iconSize} data-icon="inline-end" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size={size} rounded={rounded}>
                    <Search className={iconSize} data-icon="inline-start" />
                    Search
                  </Button>
                  <Button variant="secondary" size={size} rounded={rounded}>
                    Bookmark
                    <Bookmark className={iconSize} data-icon="inline-end" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CardDemo() {
  return (
    <Card className="w-64">
      <CardHeader className="pb-sm">
        <CardTitle>Card title</CardTitle>
        <CardDescription>Card description</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Card content
      </CardContent>
    </Card>
  );
}

function CheckboxStateDemo() {
  type CheckboxStateColumn = {
    label: string;
    className?: string;
    invalid?: boolean;
    disabled?: boolean;
  };

  type CheckboxStateRow = {
    label: string;
    checked?: boolean | "indeterminate";
  };

  const columns: CheckboxStateColumn[] = [
    { label: "State: Default" },
    { label: "State: Focus", className: "border-ring ring-3 ring-ring/50" },
    { label: "State: Error", invalid: true },
    {
      label: "State: Error Focus",
      invalid: true,
      className: "border-destructive ring-3 ring-destructive/20",
    },
    { label: "State: Disabled", disabled: true },
  ];

  const rows: CheckboxStateRow[] = [
    { label: "Checked?: False" },
    { label: "Checked?: True", checked: true },
    { label: "Checked?: Indeterminate", checked: "indeterminate" },
  ];

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[44rem] grid-cols-[10rem_repeat(5,minmax(0,1fr))] gap-x-sm gap-y-xs">
        <div />
        {columns.map((column) => (
          <p
            key={column.label}
            className="text-center text-paragraph-mini font-medium text-muted-foreground"
          >
            {column.label}
          </p>
        ))}

        {rows.map((row) => (
          <div key={row.label} className="contents">
            <p
              className="self-center text-paragraph-mini font-medium text-foreground/80"
            >
              {row.label}
            </p>

            {columns.map((column) => (
              <div
                key={`${row.label}-${column.label}`}
                className="flex items-center justify-center rounded-sm border border-dashed border-border bg-muted/30 py-sm"
              >
                <Checkbox
                  aria-label={`${row.label} ${column.label}`}
                  checked={row.checked}
                  aria-invalid={column.invalid ? "true" : undefined}
                  disabled={column.disabled}
                  className={column.className}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}


function CheckboxSectionDemo() {
  return (
    <div className="space-y-lg">
      <CheckboxStateDemo />
    </div>
  );
}

function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger>Open dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog</DialogTitle>
          <DialogDescription>This is a preview dialog.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function DropdownMenuDemo() {
  const menuItems = ["Option 1", "Option 2", "Option 3", "Option 4"] as const;

  return (
    <div className="w-full max-w-xs rounded-md border border-border bg-card p-sm">
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-sm text-foreground hover:bg-[var(--unofficial-outline-hover)]">
            Open options
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-48"
            side="bottom"
            sideOffset={4}
            align="start"
          >
            {menuItems.map((item) => (
              <DropdownMenuItem key={item}>{item}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
    </div>
  );
}

function InputDemo() {
  return <Input className="w-full max-w-xs" placeholder="Input field" />;
}

function LabelDemo() {
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[42rem] grid-cols-[9rem_minmax(0,1fr)] gap-x-sm gap-y-xs">
        <p className="self-center text-paragraph-mini font-medium text-primary">
          Type: Text Value
        </p>
        <div className="rounded-sm border border-dashed border-primary/60 bg-background p-sm">
          <div className="space-y-1.5">
            <Label htmlFor="label-text-value">Label</Label>
            <Input id="label-text-value" placeholder="Value" />
          </div>
        </div>

        <p className="self-center text-paragraph-mini font-medium text-primary">
          Type: Select
        </p>
        <div className="rounded-sm border border-dashed border-primary/60 bg-background p-sm">
          <div className="space-y-1.5">
            <Label htmlFor="label-select-item">Label</Label>
            <Select>
              <SelectTrigger id="label-select-item">
                <SelectValue placeholder="Select an item" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="item-1">Item 1</SelectItem>
                <SelectItem value="item-2">Item 2</SelectItem>
                <SelectItem value="item-3">Item 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="self-center text-paragraph-mini font-medium text-primary">
          Type: Radio
        </p>
        <div className="rounded-sm border border-dashed border-primary/60 bg-background p-sm">
          <div className="space-y-1.5">
            <Label>Label</Label>
            <div className="space-y-1.5">
              <Label
                htmlFor="label-radio-1"
                className="text-paragraph-mini font-normal text-foreground/90"
              >
                <input
                  id="label-radio-1"
                  name="label-radio-group"
                  type="radio"
                  defaultChecked
                  className="size-3.5 accent-primary"
                />
                Option 1
              </Label>
              <Label
                htmlFor="label-radio-2"
                className="text-paragraph-mini font-normal text-foreground/90"
              >
                <input
                  id="label-radio-2"
                  name="label-radio-group"
                  type="radio"
                  className="size-3.5 accent-primary"
                />
                Option 2
              </Label>
            </div>
          </div>
        </div>

        <p className="self-center text-paragraph-mini font-medium text-primary">
          Type: Textarea
        </p>
        <div className="rounded-sm border border-dashed border-primary/60 bg-background p-sm">
          <div className="space-y-1.5">
            <Label htmlFor="label-textarea">Label</Label>
            <Textarea id="label-textarea" placeholder="Type your message here." />
          </div>
        </div>

        <p className="self-center text-paragraph-mini font-medium text-primary">
          Type: Checkbox
        </p>
        <div className="rounded-sm border border-dashed border-primary/60 bg-background p-sm">
          <div className="space-y-1.5">
            <Label>Label</Label>
            <div className="space-y-1.5">
              <Label
                htmlFor="label-checkbox-1"
                className="text-paragraph-mini font-normal text-foreground/90"
              >
                <Checkbox id="label-checkbox-1" defaultChecked />
                Option 1
              </Label>
              <Label
                htmlFor="label-checkbox-2"
                className="text-paragraph-mini font-normal text-foreground/90"
              >
                <Checkbox id="label-checkbox-2" />
                Option 2
              </Label>
              <Label
                htmlFor="label-checkbox-3"
                className="text-paragraph-mini font-normal text-foreground/90"
              >
                <Checkbox id="label-checkbox-3" />
                Option 3
              </Label>
            </div>
          </div>
        </div>

        <p className="self-center text-paragraph-mini font-medium text-primary">
          Type: Slider
        </p>
        <div className="rounded-sm border border-dashed border-primary/60 bg-background p-sm">
          <div className="space-y-1.5">
            <Label htmlFor="label-slider">Label</Label>
            <input
              id="label-slider"
              type="range"
              min={0}
              max={100}
              defaultValue={50}
              className="w-full accent-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectDemo() {
  return (
    <div className="w-full max-w-xs rounded-md border border-border bg-card p-sm">
      <div className="space-y-1">
        <Label htmlFor="select-demo-trigger">Label</Label>
        <Select>
          <SelectTrigger id="select-demo-trigger" className="w-full">
            <SelectValue placeholder="Placeholder" />
          </SelectTrigger>
          <SelectContent
            side="bottom"
            sideOffset={4}
            align="start"
            alignItemWithTrigger={false}
          >
            <SelectItem value="option-1">Option 1</SelectItem>
            <SelectItem value="option-2">Option 2</SelectItem>
            <SelectItem value="option-3">Option 3</SelectItem>
            <SelectItem value="option-4">Option 4</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function StepIndicatorDemo() {
  return (
    <div className="w-full max-w-xs rounded-md border border-border bg-card p-sm">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Components</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

function TextareaDemo() {
  return <Textarea className="w-64" placeholder="Textarea" />;
}

function TooltipDemo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>Hover</TooltipTrigger>
        <TooltipContent>Tooltip content</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function FurnitureItemCardDemo() {
  const [simpleSelected, setSimpleSelected] = useState(false)
  const [simpleQty, setSimpleQty] = useState(1)
  const [simpleNotes, setSimpleNotes] = useState("")

  const [subSelected, setSubSelected] = useState(false)
  const [subNotes, setSubNotes] = useState("")
  const [subOptions, setSubOptions] = useState([
    { id: "single", label: "Single", quantity: 0 },
    { id: "double", label: "Double", quantity: 0 },
    { id: "queen", label: "Queen", quantity: 0 },
  ])

  const handleSubQty = (id: string, next: number) => {
    setSubOptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, quantity: next } : s))
    )
  }

  return (
    <div className="flex flex-wrap gap-4">
      <FurnitureItemCard
        label="Chair"
        selected={simpleSelected}
        quantity={simpleQty}
        notes={simpleNotes}
        onToggle={setSimpleSelected}
        onQuantityChange={setSimpleQty}
        onNotesChange={setSimpleNotes}
      />
      <FurnitureItemCard
        label="Bed"
        selected={subSelected}
        quantity={subOptions.reduce((acc, s) => acc + s.quantity, 0)}
        notes={subNotes}
        subOptions={subOptions}
        onToggle={setSubSelected}
        onNotesChange={setSubNotes}
        onSubQuantityChange={handleSubQty}
      />
    </div>
  )
}

function SelectAndComboDemo() {
  const [value, setValue] = useState(2);

  return (
    <SelectAndCombo
      value={value}
      onChange={setValue}
      min={1}
      max={10}
      className="w-full max-w-xs"
    />
  );
}

// ─── registry ─────────────────────────────────────────────────────────────────
// To add a base component: add an entry to BASE_COMPONENTS.
// To add a composed component: add an entry to COMPOSED_COMPONENTS.

const BASE_COMPONENTS: { name: string; Demo: () => ReactNode }[] = [
  { name: "Badge", Demo: BadgeDemo },
  { name: "Breadcrumb", Demo: BreadcrumbDemo },
  { name: "Button", Demo: ButtonDemo },
  { name: "Card", Demo: CardDemo },
  { name: "Dialog", Demo: DialogDemo },
  { name: "DropdownMenu", Demo: DropdownMenuDemo },
  { name: "Input", Demo: InputDemo },
  { name: "Label", Demo: LabelDemo },
  { name: "Select", Demo: SelectDemo },
  { name: "StepIndicator", Demo: StepIndicatorDemo },
  { name: "Textarea", Demo: TextareaDemo },
  { name: "Tooltip", Demo: TooltipDemo },
];

const COMPOSED_COMPONENTS: { name: string; Demo: () => ReactNode }[] = [
  { name: "SelectAndCombo", Demo: SelectAndComboDemo },
  { name: "FurnitureItemCard", Demo: FurnitureItemCardDemo },
];

// ─── page ─────────────────────────────────────────────────────────────────────

export default function ComponentsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <h1 className="text-heading-3 font-semibold">Component Gallery</h1>
          <Link href="/">
            <Button variant="secondary" size="sm">
              Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full space-y-xl">
        <Section title="Base components">
          <div className="space-y-sm">
            {BASE_COMPONENTS.map(({ name, Demo }) => (
              <ComponentRow key={name} name={name}>
                <Demo />
              </ComponentRow>
            ))}
          </div>
        </Section>

        <Section title="Checkbox">
          <ComponentRow name="Checkbox">
            <CheckboxSectionDemo />
          </ComponentRow>
        </Section>

        <Section title="Composed components">
          {COMPOSED_COMPONENTS.length === 0 ? (
            <p className="text-paragraph-small text-muted-foreground">
              No composed components yet. Add entries to{" "}
              <code>COMPOSED_COMPONENTS</code> in this file.
            </p>
          ) : (
            <div className="space-y-sm">
              {COMPOSED_COMPONENTS.map(({ name, Demo }) => (
                <ComponentRow key={name} name={name}>
                  <Demo />
                </ComponentRow>
              ))}
            </div>
          )}
        </Section>
      </main>
    </div>
  );
}
