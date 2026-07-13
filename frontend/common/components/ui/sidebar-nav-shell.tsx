"use client";

import type { ReactNode } from "react";

import { cn } from "@/common/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
} from "@/common/components/ui/sidebar";
import { SidebarNavToggle } from "@/common/components/ui/sidebar-nav-toggle";

type SidebarNavShellProps = {
  children: ReactNode;
  className?: string;
};

function SidebarNavShell({ children, className }: SidebarNavShellProps) {
  return (
    <Sidebar collapsible="icon" className={cn("h-full", className)}>
      <SidebarHeader className="mb-0">
        <SidebarNavToggle />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-xl">{children}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export { SidebarNavShell };
