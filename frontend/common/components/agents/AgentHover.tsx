"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/common/components/ui/tooltip";
import { cn } from "@/common/lib/utils";

export type AgentRole = "primary" | "secondary";

export type AgentHoverProps = {
  firstName: string;
  lastName: string;
  role: AgentRole;
  imageUrl?: string;
  size?: "default" | "sm" | "lg";
  className?: string;
};

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getRoleLabel(role: AgentRole) {
  return role === "primary" ? "Primary Agent" : "Secondary Agent";
}

function AgentAvatar({
  firstName,
  lastName,
  imageUrl,
  size,
}: Pick<AgentHoverProps, "firstName" | "lastName" | "imageUrl" | "size">) {
  const fullName = `${firstName} ${lastName}`;
  const initials = getInitials(firstName, lastName);

  return (
    <Avatar size={size}>
      {imageUrl ? <AvatarImage src={imageUrl} alt={fullName} /> : null}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}

/** Requires a parent `TooltipProvider` so multiple agents share one timing group. */
export function AgentHover({
  firstName,
  lastName,
  role,
  imageUrl,
  size = "default",
  className,
}: AgentHoverProps) {
  const fullName = `${firstName} ${lastName}`;
  const roleLabel = getRoleLabel(role);

  return (
    <Tooltip>
      <TooltipTrigger
        className={cn("inline-flex cursor-default rounded-full", className)}
      >
        <AgentAvatar
          firstName={firstName}
          lastName={lastName}
          imageUrl={imageUrl}
          size={size}
        />
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="center"
        sideOffset={10}
        className={cn(
          "max-w-none gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-md",
          "[&>*:last-child]:hidden"
        )}
      >
        <AgentAvatar
          firstName={firstName}
          lastName={lastName}
          imageUrl={imageUrl}
          size={size}
        />
        <div className="flex flex-col gap-0.5 pr-1">
          <span className="font-semibold text-foreground">{fullName}</span>
          <span className="text-muted-foreground">{roleLabel}</span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
