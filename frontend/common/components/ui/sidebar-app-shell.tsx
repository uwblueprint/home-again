"use client";

import type { ReactNode } from "react";

import { cn } from "@/common/lib/utils";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/common/components/ui/sidebar";
import { TooltipProvider } from "@/common/components/ui/tooltip";

type SidebarAppShellProps = {
  sidebar: ReactNode;
  children: ReactNode;
  className?: string;
};

function SidebarAppShell({
  sidebar,
  children,
  className,
}: SidebarAppShellProps) {
  return (
    <TooltipProvider>
      <SidebarProvider className={cn("min-h-svh", className)}>
        {sidebar}
        <SidebarInset className="min-h-svh">
          <div className="flex h-12 shrink-0 items-center border-b border-border px-sm md:hidden">
            <SidebarTrigger />
          </div>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

export { SidebarAppShell };
