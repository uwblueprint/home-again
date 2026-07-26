"use client";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";

import { cn } from "@/common/lib/utils";

function Collapsible({ ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({ ...props }: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
  );
}

function CollapsiblePanel({
  className,
  ...props
}: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-panel"
      // The panel has to consume --collapsible-panel-height, which base-ui
      // measures onto the element, and be zero-height whenever it is closed.
      // `data-closed` is the one that actually matters: base-ui frequently
      // settles there with an inline `transition-duration: 0s` and never applies
      // data-ending-style, so keying the collapse off the transition states
      // alone leaves the panel stuck at full height. The starting/ending styles
      // only smooth the cases where a transition does run.
      className={cn(
        "h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-150 ease-out data-closed:h-0 data-ending-style:h-0 data-starting-style:h-0",
        className
      )}
      {...props}
    />
  );
}

export { Collapsible, CollapsibleTrigger, CollapsiblePanel };
