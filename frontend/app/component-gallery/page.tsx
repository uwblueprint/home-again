"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { FormBreadcrumb } from "@/common/components/forms";
import {
  Badge,
  BreadcrumbItem,
  BreadcrumbNumber,
  BreadcrumbLabel,
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
  InputError,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StepIndicator,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/common/components/ui";

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
    <ul className="list-none p-0">
      <BreadcrumbItem>
        <BreadcrumbNumber>1</BreadcrumbNumber>
        <BreadcrumbLabel>Label</BreadcrumbLabel>
      </BreadcrumbItem>
    </ul>
  );
}

function FormBreadcrumbDemo() {
  const steps = [
    { label: "Client info" },
    { label: "Referral details" },
    { label: "Review" },
  ];

  return <FormBreadcrumb steps={steps} />;
}

function ButtonDemo() {
  return <Button variant="outline">Sample button</Button>;
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

function CheckboxDemo() {
  return <Checkbox defaultChecked aria-label="Sample checkbox" />;
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Item one</DropdownMenuItem>
        <DropdownMenuItem>Item two</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function InputDemo() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-xs">
      <Input placeholder="Input field" />
      <Input
        aria-invalid
        defaultValue="Invalid value"
        placeholder="Error state"
      />
      <InputError>This field is required.</InputError>
    </div>
  );
}

function LabelDemo() {
  return (
    <div className="flex items-center gap-sm">
      <Label htmlFor="label-demo">Label</Label>
      <Input id="label-demo" className="w-48" placeholder="With label" />
    </div>
  );
}

function SelectDemo() {
  return (
    <Select>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Choose an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="one">Option one</SelectItem>
        <SelectItem value="two">Option two</SelectItem>
        <SelectItem value="three">Option three</SelectItem>
      </SelectContent>
    </Select>
  );
}

function StepIndicatorDemo() {
  return (
    <StepIndicator
      steps={[{ label: "One" }, { label: "Two" }, { label: "Three" }]}
      currentStep={1}
    />
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

// ─── registry ─────────────────────────────────────────────────────────────────
// To add a base component: add an entry to BASE_COMPONENTS.
// To add a composed component: add an entry to COMPOSED_COMPONENTS.

const BASE_COMPONENTS: { name: string; Demo: () => ReactNode }[] = [
  { name: "Badge", Demo: BadgeDemo },
  { name: "Breadcrumb", Demo: BreadcrumbDemo },
  { name: "Button", Demo: ButtonDemo },
  { name: "Card", Demo: CardDemo },
  { name: "Checkbox", Demo: CheckboxDemo },
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
  { name: "Form breadcrumb", Demo: FormBreadcrumbDemo },
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
