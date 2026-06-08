"use client";

import * as React from "react";

import { cn } from "@/common/lib/utils";

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn(
        "group/step inline-flex items-center gap-xs p-0",
        className
      )}
      {...props}
    />
  );
}

type BreadcrumbNumberProps = React.ComponentProps<"span"> & {
  current?: boolean;
};

function BreadcrumbNumber({
  className,
  current,
  ...props
}: BreadcrumbNumberProps) {
  return (
    <span
      data-slot="breadcrumb-number"
      aria-current={current ? "step" : undefined}
      className={cn(
        "flex aspect-square size-[26px] shrink-0 flex-col items-center justify-center gap-[10px] rounded-full bg-neutral-100 px-[10px] py-[5px]",
        "font-sans text-[16px] font-medium leading-[1.5] tracking-[-0.176px] text-muted-foreground group-hover/step:text-foreground",
        current && "text-foreground",
        className
      )}
      {...props}
    />
  );
}

type BreadcrumbLabelProps = React.ComponentProps<"span"> & {
  current?: boolean;
};

function BreadcrumbLabel({
  className,
  current,
  ...props
}: BreadcrumbLabelProps) {
  return (
    <span
      data-slot="breadcrumb-label"
      className={cn(
        "font-normal text-paragraph-small [color:var(--muted-foreground)] group-hover/step:[color:var(--foreground)]",
        current && "[color:var(--foreground)]",
        className
      )}
      {...props}
    />
  );
}

export { BreadcrumbItem, BreadcrumbNumber, BreadcrumbLabel };
