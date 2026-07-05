"use client";

import type { ComponentType } from "react";

import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/common/components/ui/sidebar";
import {
  SidebarAgentsIcon,
  SidebarClientReferralsIcon,
  SidebarClientsIcon,
} from "@/common/components/ui/sidebar-icons";
import { SidebarNavShell } from "@/common/components/ui/sidebar-nav-shell";

export type AgentSidebarActiveItem =
  | "client-referrals"
  | "clients"
  | "agents";

type AgentSidebarProps = {
  className?: string;
  activeItem?: AgentSidebarActiveItem;
};

type SidebarIconComponent = ComponentType<{ className?: string }>;

const AGENT_NAV_ITEMS: {
  id: AgentSidebarActiveItem;
  label: string;
  icon: SidebarIconComponent;
}[] = [
  {
    id: "client-referrals",
    label: "Client Referrals",
    icon: SidebarClientReferralsIcon,
  },
  { id: "clients", label: "Clients", icon: SidebarClientsIcon },
  { id: "agents", label: "Agents", icon: SidebarAgentsIcon },
];

function AgentSidebar({ className, activeItem }: AgentSidebarProps) {
  return (
    <SidebarNavShell className={className}>
      {AGENT_NAV_ITEMS.map(({ id, label, icon: Icon }) => (
        <SidebarMenuItem key={id}>
          <SidebarMenuButton isActive={activeItem === id} tooltip={label}>
            <Icon />
            <span>{label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarNavShell>
  );
}

export { AgentSidebar };
