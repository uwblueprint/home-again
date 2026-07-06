"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
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
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toLowerCase();
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
    <TooltipPrimitive.Provider delay={0}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger
          className={cn("inline-flex cursor-default rounded-full", className)}
        >
          <AgentAvatar
            firstName={firstName}
            lastName={lastName}
            imageUrl={imageUrl}
            size={size}
          />
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Positioner
            side="top"
            align="center"
            sideOffset={10}
            className="isolate z-50"
          >
            <TooltipPrimitive.Popup
              className={cn(
                "z-50 flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 shadow-md",
                "origin-(--transform-origin) whitespace-nowrap",
                "data-[side=top]:slide-in-from-bottom-2",
                "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
                "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
              )}
            >
              <AgentAvatar
                firstName={firstName}
                lastName={lastName}
                imageUrl={imageUrl}
                size={size}
              />
              <div className="flex flex-col gap-0.5 pr-1">
                <span className="text-sm font-semibold text-foreground">
                  {fullName}
                </span>
                <span className="text-sm text-muted-foreground">
                  {roleLabel}
                </span>
              </div>
            </TooltipPrimitive.Popup>
          </TooltipPrimitive.Positioner>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
