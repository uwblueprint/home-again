"use client";

import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";

import { RadioGroup, RadioGroupItem } from "@/common/components/ui/radio-group";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/common/components/ui/toggle-group";
import { cn } from "@/common/lib/utils";

type SortMenuOption = {
  /** Stable identifier reported through `onChange`. */
  value: string;
  /** Text shown next to the radio. */
  label: string;
  disabled?: boolean;
};

type SortDirection = "asc" | "desc";

type SortMenuProps = {
  /** Options rendered as radio buttons. */
  options: SortMenuOption[];
  /** Currently selected option value (controlled). */
  value: string | null;
  /** Fired with the newly selected value. */
  onChange: (value: string) => void;
  /** Fired when the reset action is pressed. The action is hidden when omitted. */
  onReset?: () => void;
  /** Heading shown above the options. Pass an empty string to hide it. @default "Sort by" */
  label?: string;
  /** Text for the reset action. @default "Reset" */
  resetLabel?: string;
  /**
   * Current sort direction (controlled). Pass together with
   * `onDirectionChange` to show ↑ (ascending) / ↓ (descending) toggles beside
   * the heading; the toggles are hidden when either is omitted.
   */
  direction?: SortDirection;
  /** Fired with the newly chosen direction. */
  onDirectionChange?: (direction: SortDirection) => void;
  className?: string;
};

const DIRECTION_OPTIONS: {
  value: SortDirection;
  label: string;
  Icon: LucideIcon;
}[] = [
  { value: "asc", label: "Ascending", Icon: ArrowUp },
  { value: "desc", label: "Descending", Icon: ArrowDown },
];

/**
 * Generic single-select sort panel. Renders a labelled radio group plus an
 * optional reset action. Selection is controlled by the consumer so any list,
 * table, or query can supply its own sort options. Drop it inside a popover /
 * dropdown trigger, or render it inline.
 */
function SortMenu({
  options,
  value,
  onChange,
  onReset,
  label = "Sort by",
  resetLabel = "Reset",
  direction,
  onDirectionChange,
  className,
}: SortMenuProps) {
  const showDirection = direction !== undefined && onDirectionChange;
  const heading = label ? (
    <p className="text-paragraph-small text-muted-foreground">{label}</p>
  ) : null;

  return (
    <div
      data-slot="sort-menu"
      className={cn(
        "flex flex-col gap-xs rounded-lg border border-border bg-card p-md text-foreground shadow-md",
        className
      )}
    >
      {showDirection ? (
        <div className="flex items-center gap-sm">
          {heading}
          <ToggleGroup
            aria-label="Sort direction"
            value={[direction]}
            onValueChange={(next) => {
              // Pressing the active arrow would leave nothing selected;
              // a sort always has a direction, so ignore that.
              const [nextDirection] = next;
              if (nextDirection === "asc" || nextDirection === "desc") {
                onDirectionChange(nextDirection);
              }
            }}
            className="ml-auto gap-(--2xs)"
          >
            {DIRECTION_OPTIONS.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                aria-label={option.label}
                className="size-6 min-w-6 p-0"
              >
                <option.Icon className="size-4" />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      ) : (
        heading
      )}
      <RadioGroup
        value={value}
        onValueChange={(next) => {
          // base-ui can emit null (e.g. when nothing is selected); only
          // forward concrete values so consumers always receive a string.
          if (next != null) onChange(next as string);
        }}
      >
        {options.map((option) => (
          <label
            key={option.value}
            data-disabled={option.disabled || undefined}
            className="flex h-6 cursor-pointer items-center gap-xs rounded-md px-xs py-(--scale-hacks-5p5) transition-colors hover:bg-accent data-disabled:pointer-events-none data-disabled:opacity-50"
          >
            <RadioGroupItem value={option.value} disabled={option.disabled} />
            <span className="text-paragraph-small whitespace-nowrap text-foreground">
              {option.label}
            </span>
          </label>
        ))}
      </RadioGroup>
      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="w-full cursor-pointer text-right text-paragraph-small text-foreground underline"
        >
          {resetLabel}
        </button>
      ) : null}
    </div>
  );
}

export { SortMenu };
export type { SortDirection, SortMenuOption, SortMenuProps };
