"use client";

import type { ReactNode } from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { Sofa } from "lucide-react";

import { cn } from "@/common/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
} from "@/common/components/ui/tabs";

function FurnitureCategoryIcon({ className }: { className?: string }) {
  return (
    <Sofa
      aria-hidden="true"
      className={cn("size-5 shrink-0", className)}
      strokeWidth={1.75}
    />
  );
}

function FurnitureCategoryTabs({
  className,
  ...props
}: React.ComponentProps<typeof Tabs>) {
  return <Tabs className={className} {...props} />;
}

function FurnitureCategoryTabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsList>) {
  return <TabsList className={className} {...props} />;
}

function FurnitureCategoryTabsTrigger({
  className,
  children,
  icon,
  ...props
}: TabsPrimitive.Tab.Props & {
  icon?: ReactNode;
}) {
  return (
    <TabsPrimitive.Tab
      data-slot="furniture-category-tabs-trigger"
      className={cn(
        "relative flex min-h-[29px] min-w-[29px] items-center justify-center gap-sm border-b-2 border-transparent px-2xl py-xs text-paragraph-regular font-medium whitespace-nowrap text-neutral-400 transition-colors [&:not([data-active])]:hover:text-neutral-500 data-active:border-[var(--brand-purples-700)] data-active:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </TabsPrimitive.Tab>
  );
}

function FurnitureCategoryTabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsContent>) {
  return <TabsContent className={className} {...props} />;
}

export {
  FurnitureCategoryTabs,
  FurnitureCategoryTabsList,
  FurnitureCategoryTabsTrigger,
  FurnitureCategoryTabsContent,
  FurnitureCategoryIcon,
};
