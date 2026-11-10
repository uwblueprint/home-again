"use client";

import { RadioGroup, RadioGroupItem } from "@/common/components/ui/radio-group";
import { cn } from "@/common/lib/utils";

type SortMenuOption = {
  /** Stable identifier reported through `onChange`. */
  value: string;
  /** Text shown next to the radio. */
  label: string;
  disabled?: boolean;
};

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
  className?: string;
};

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
  className,
}: SortMenuProps) {
  return (
    <div
      data-slot="sort-menu"
      className={cn(
        "flex flex-col gap-xs rounded-lg border border-border bg-card p-md text-foreground shadow-md",
        className
      )}
    >
      {label ? (
        <p className="text-paragraph-small text-muted-foreground">{label}</p>
      ) : null}
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
export type { SortMenuOption, SortMenuProps };
