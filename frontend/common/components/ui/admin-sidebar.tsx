"use client";

import type { ComponentType } from "react";
import { useEffect, useState } from "react";

import { cn } from "@/common/lib/utils";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/common/components/ui/sidebar";
import {
  SidebarAgenciesIcon,
  SidebarChevronIcon,
  SidebarDonorsIcon,
  SidebarFurnitureIcon,
  SidebarHomeIcon,
  SidebarManageAdminsIcon,
  SidebarReferralsAndDonationsIcon,
  SidebarReportsIcon,
  SidebarRoutesAndSchedulingIcon,
} from "@/common/components/ui/sidebar-icons";
import { SidebarNavShell } from "@/common/components/ui/sidebar-nav-shell";

export type AdminSidebarActiveItem =
  | "home"
  | "client-referrals"
  | "donation-requests"
  | "routes-and-scheduling"
  | "agencies"
  | "manage-admins"
  | "donors"
  | "furniture"
  | "reports";

type AdminSidebarProps = {
  className?: string;
  activeItem?: AdminSidebarActiveItem;
  defaultReferralsOpen?: boolean;
};

type SidebarIconComponent = ComponentType<{ className?: string }>;

const ADMIN_NAV_ITEMS: {
  id: Exclude<
    AdminSidebarActiveItem,
    "home" | "client-referrals" | "donation-requests"
  >;
  label: string;
  icon: SidebarIconComponent;
}[] = [
  {
    id: "routes-and-scheduling",
    label: "Routes & Scheduling",
    icon: SidebarRoutesAndSchedulingIcon,
  },
  { id: "agencies", label: "Agencies", icon: SidebarAgenciesIcon },
  { id: "donors", label: "Donors", icon: SidebarDonorsIcon },
  { id: "furniture", label: "Furniture", icon: SidebarFurnitureIcon },
  { id: "reports", label: "Reports", icon: SidebarReportsIcon },
  {
    id: "manage-admins",
    label: "Manage Admins",
    icon: SidebarManageAdminsIcon,
  },
];

function isReferralsSubItemActive(
  activeItem: AdminSidebarActiveItem | undefined
) {
  return (
    activeItem === "client-referrals" || activeItem === "donation-requests"
  );
}

function AdminSidebar({
  className,
  activeItem,
  defaultReferralsOpen = true,
}: AdminSidebarProps) {
  const [referralsOpen, setReferralsOpen] = useState(
    () => defaultReferralsOpen || isReferralsSubItemActive(activeItem)
  );

  useEffect(() => {
    if (isReferralsSubItemActive(activeItem)) {
      setReferralsOpen(true);
    }
  }, [activeItem]);

  return (
    <SidebarNavShell className={className}>
      <SidebarMenuItem>
        <SidebarMenuButton isActive={activeItem === "home"} tooltip="Home">
          <SidebarHomeIcon />
          <span>Home</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem className="flex flex-col gap-xl">
        <SidebarMenuButton tooltip="Referrals & Donations">
          <SidebarReferralsAndDonationsIcon />
          <span>Referrals & Donations</span>
        </SidebarMenuButton>
        <SidebarMenuAction
          aria-label={
            referralsOpen ? "Collapse referrals menu" : "Expand referrals menu"
          }
          onClick={(event) => {
            event.stopPropagation();
            setReferralsOpen((open) => !open);
          }}
        >
          <SidebarChevronIcon className={cn(!referralsOpen && "rotate-180")} />
        </SidebarMenuAction>
        {referralsOpen ? (
          <SidebarMenuSub className="gap-xl py-0">
            <SidebarMenuSubItem>
              <SidebarMenuSubButton
                isActive={activeItem === "client-referrals"}
              >
                <span>Client Referrals</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton
                isActive={activeItem === "donation-requests"}
              >
                <span>Donation Requests</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        ) : null}
      </SidebarMenuItem>
      {ADMIN_NAV_ITEMS.map(({ id, label, icon: Icon }) => (
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

export { AdminSidebar };
