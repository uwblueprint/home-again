"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@/common/lib/utils";
import { Tabs, TabsContent } from "@/common/components/ui/tabs";

function SubTabs({ className, ...props }: React.ComponentProps<typeof Tabs>) {
  return <Tabs className={className} {...props} />;
}

function SubTabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="subtabs-list"
      className={cn(
        "inline-flex w-fit items-center rounded-xl bg-secondary p-1",
        className
      )}
      {...props}
    />
  );
}

function SubTabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="subtabs-trigger"
      className={cn(
        "relative inline-flex min-h-8 min-w-8 items-center justify-center gap-xs rounded-[var(--radius)] px-sm py-[var(--scale-hacks-5p5)] text-sm font-medium whitespace-nowrap text-foreground transition-colors [&:not([data-active])]:hover:bg-[var(--unofficial-outline-hover)] data-active:bg-background data-active:shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

function SubTabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsContent>) {
  return <TabsContent className={className} {...props} />;
}

export { SubTabs, SubTabsList, SubTabsTrigger, SubTabsContent };
