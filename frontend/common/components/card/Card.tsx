"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/common/lib/utils";

/**
 * Modular card primitives from the Home Again design system.
 * (Figma: Home Again Design System › Cards › Card)
 *
 * The Figma component exposes a handful of toggleable parts — a collapsible
 * title bar, a main heading, content slots and an action footer. Rather than a
 * single component with a pile of boolean props, those parts are exported as
 * composable subcomponents so each use case (information panel, collapsible
 * item accordion, form card, …) assembles exactly the pieces it needs.
 *
 * @example
 * <Card>
 *   <CardHeading>Client Information</CardHeading>
 *   {/* …content… *\/}
 * </Card>
 */

// Root ------------------------------------------------------------------------

/**
 * Card container. Renders the white, bordered, softly-shadowed surface with the
 * design system's padding and a `gap-lg` rhythm between its children.
 *
 * For a collapsible card, pass `className="gap-0"` and wrap the body in
 * {@link CardCollapsibleContent}, which manages its own spacing so the card
 * shrinks flush to the header when collapsed.
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex w-full flex-col gap-lg rounded-xl border border-[var(--unofficial-border-3)] bg-background px-2xl py-xl shadow-sm",
        className
      )}
      {...props}
    />
  );
}

// Collapsible header ----------------------------------------------------------

type CardCollapseHeaderProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "title"
> & {
  /** Muted title shown on the left of the bar. */
  title: React.ReactNode;
  /** Optional element (e.g. a `<Badge />`) rendered next to the title. */
  badge?: React.ReactNode;
  /** Open state — controls the chevron direction and `aria-expanded`. */
  open?: boolean;
  /** When provided, the whole bar becomes an interactive toggle button. */
  onToggle?: () => void;
  /** Hide the trailing icon entirely. */
  showIcon?: boolean;
  /** Override the trailing icon (defaults to a chevron that flips on `open`). */
  icon?: React.ReactNode;
};

/**
 * Collapsible title bar — the muted "Title 1 + Badge + chevron" row. Pass
 * `onToggle` to make it an accordion trigger; pair it with
 * {@link CardCollapsibleContent} for the animated body.
 */
function CardCollapseHeader({
  title,
  badge,
  open,
  onToggle,
  showIcon = true,
  icon,
  className,
  ...props
}: CardCollapseHeaderProps) {
  const body = (
    <>
      <div className="flex items-center gap-md">
        <span className="text-paragraph-large text-muted-foreground">
          {title}
        </span>
        {badge}
      </div>
      {showIcon &&
        (icon ?? (
          <ChevronDown
            aria-hidden
            className={cn(
              "size-6 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        ))}
    </>
  );

  if (onToggle) {
    return (
      <button
        type="button"
        data-slot="card-collapse-header"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between text-left",
          className
        )}
        {...props}
      >
        {body}
      </button>
    );
  }

  return (
    <div
      data-slot="card-collapse-header"
      className={cn("flex w-full items-center justify-between", className)}
      {...props}
    >
      {body}
    </div>
  );
}

// Heading ---------------------------------------------------------------------

type CardHeadingProps = React.ComponentProps<"h3"> & {
  /** Optional element rendered on the right of the heading row. */
  action?: React.ReactNode;
};

/**
 * Main heading row ("heading 4", semibold, foreground). Pass `action` to place
 * a control (icon button, link, …) on the right of the row.
 */
function CardHeading({
  className,
  children,
  action,
  ...props
}: CardHeadingProps) {
  return (
    <div className="flex w-full items-start justify-between gap-md">
      <h3
        data-slot="card-heading"
        className={cn(
          "text-heading-4 font-semibold text-foreground",
          className
        )}
        {...props}
      >
        {children}
      </h3>
      {action}
    </div>
  );
}

// Footer ----------------------------------------------------------------------

/**
 * Right-aligned action row. Drop `<Button />`s in as children — typically a
 * secondary action followed by a primary one.
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex w-full items-center justify-end gap-md", className)}
      {...props}
    />
  );
}

// Collapsible content ---------------------------------------------------------

type CardCollapsibleContentProps = React.ComponentProps<"div"> & {
  /** Whether the body is expanded. */
  open: boolean;
};

/**
 * Animated body for a collapsible card. Expands/collapses with a grid-rows
 * transition and keeps its children on the card's `gap-lg` rhythm. Use inside a
 * `<Card className="gap-0">` so the card collapses flush to the header.
 */
function CardCollapsibleContent({
  open,
  className,
  children,
  ...props
}: CardCollapsibleContentProps) {
  return (
    <div
      data-slot="card-collapsible-content"
      data-state={open ? "open" : "closed"}
      className={cn(
        "grid transition-[grid-template-rows] duration-300 ease-in-out",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}
      {...props}
    >
      <div className="overflow-hidden">
        <div className={cn("flex flex-col gap-lg pt-lg", className)}>
          {children}
        </div>
      </div>
    </div>
  );
}

export {
  Card,
  CardCollapseHeader,
  CardHeading,
  CardFooter,
  CardCollapsibleContent,
};
export type {
  CardCollapseHeaderProps,
  CardHeadingProps,
  CardCollapsibleContentProps,
};
