import {
  Building2,
  ChevronUp,
  FileText,
  Handshake,
  Home,
  IdCard,
  PanelLeftClose,
  PanelLeftOpen,
  Sofa,
  Truck,
  UserRound,
  Users,
} from "lucide-react";

import { cn } from "@/common/lib/utils";

type SidebarIconProps = {
  className?: string;
};

const sidebarIconStroke = 1.75;

export function SidebarCollapseIcon({ className }: SidebarIconProps) {
  return (
    <PanelLeftClose
      aria-hidden="true"
      className={cn("size-[13px] shrink-0 text-neutral-600", className)}
      strokeWidth={sidebarIconStroke}
    />
  );
}

export function SidebarExpandIcon({ className }: SidebarIconProps) {
  return (
    <PanelLeftOpen
      aria-hidden="true"
      className={cn("size-[13px] shrink-0 text-neutral-600", className)}
      strokeWidth={sidebarIconStroke}
    />
  );
}

export function SidebarChevronIcon({ className }: SidebarIconProps) {
  return (
    <ChevronUp
      aria-hidden="true"
      className={cn(
        "size-3 shrink-0 text-neutral-800 transition-transform",
        className
      )}
      strokeWidth={sidebarIconStroke}
    />
  );
}

export function SidebarHomeIcon({ className }: SidebarIconProps) {
  return (
    <Home
      aria-hidden="true"
      className={cn("size-[13px] shrink-0 text-neutral-800", className)}
      strokeWidth={sidebarIconStroke}
    />
  );
}

export function SidebarReferralsAndDonationsIcon({
  className,
}: SidebarIconProps) {
  return (
    <Handshake
      aria-hidden="true"
      className={cn("size-[15px] shrink-0 text-neutral-800", className)}
      strokeWidth={sidebarIconStroke}
    />
  );
}

export function SidebarRoutesAndSchedulingIcon({ className }: SidebarIconProps) {
  return (
    <Truck
      aria-hidden="true"
      className={cn("size-[15px] shrink-0 text-neutral-800", className)}
      strokeWidth={sidebarIconStroke}
    />
  );
}

export function SidebarAgenciesIcon({ className }: SidebarIconProps) {
  return (
    <Building2
      aria-hidden="true"
      className={cn("size-[15px] shrink-0 text-neutral-800", className)}
      strokeWidth={sidebarIconStroke}
    />
  );
}

export function SidebarPeopleIcon({ className }: SidebarIconProps) {
  return (
    <UserRound
      aria-hidden="true"
      className={cn("size-[15px] shrink-0 text-neutral-800", className)}
      strokeWidth={sidebarIconStroke}
    />
  );
}

export const SidebarDonorsIcon = SidebarPeopleIcon;

export function SidebarFurnitureIcon({ className }: SidebarIconProps) {
  return (
    <Sofa
      aria-hidden="true"
      className={cn("size-[15px] shrink-0 text-neutral-800", className)}
      strokeWidth={sidebarIconStroke}
    />
  );
}

export function SidebarReportsIcon({ className }: SidebarIconProps) {
  return (
    <FileText
      aria-hidden="true"
      className={cn("size-[15px] shrink-0 text-neutral-800", className)}
      strokeWidth={sidebarIconStroke}
    />
  );
}

export const SidebarManageAdminsIcon = SidebarPeopleIcon;

export const SidebarClientReferralsIcon = SidebarReferralsAndDonationsIcon;

export function SidebarClientsIcon({ className }: SidebarIconProps) {
  return (
    <Users
      aria-hidden="true"
      className={cn("size-[15px] shrink-0 text-neutral-800", className)}
      strokeWidth={sidebarIconStroke}
    />
  );
}

export function SidebarAgentsIcon({ className }: SidebarIconProps) {
  return (
    <IdCard
      aria-hidden="true"
      className={cn("size-[15px] shrink-0 text-neutral-800", className)}
      strokeWidth={sidebarIconStroke}
    />
  );
}
