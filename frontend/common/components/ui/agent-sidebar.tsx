"use client";

import Link from "next/link";
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
import { AGENT_DASH, AGENT_DASH_AGENTS, AGENT_DASH_CLIENTS } from "@/common/constants";

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
  href?: string;
}[] = [
  {
    id: "client-referrals",
    label: "Client Referrals",
    icon: SidebarClientReferralsIcon,
    href: AGENT_DASH,
  },
  {
    id: "clients",
    label: "Clients",
    icon: SidebarClientsIcon,
    href: AGENT_DASH_CLIENTS,
  },
  {
    id: "agents",
    label: "Agents",
    icon: SidebarAgentsIcon,
    href: AGENT_DASH_AGENTS,
  },
];

function AgentSidebar({ className, activeItem }: AgentSidebarProps) {
  return (
    <SidebarNavShell className={className}>
      {AGENT_NAV_ITEMS.map(({ id, label, icon: Icon, href }) => (
        <SidebarMenuItem key={id}>
          <SidebarMenuButton
            isActive={activeItem === id}
            tooltip={label}
            render={href ? <Link href={href} /> : undefined}
          >
            <Icon />
            <span>{label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarNavShell>
  );
}

export { AgentSidebar };
