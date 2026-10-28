"use client";

import { ChevronDown } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

import type { AgentRole } from "@/common/components/agents";
import { Avatar, AvatarFallback } from "@/common/components/ui/avatar";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/common/components/ui/collapsible";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog";

// TYPES
export type ReferralDialogAgent = {
  firstName: string;
  lastName: string;
  role: AgentRole;
  email: string;
  phone: string;
};

export type ReferralDialogReferral = {
  clientName: string;
  referralId: string;
  submittedAt: string;
  previousSubmissionAt?: string;
  agents: ReferralDialogAgent[];
};

export type ReferralDialogLayoutProps = {
  title: string;
  description?: ReactNode;
  referral: ReferralDialogReferral;
  /** Dialog-specific content rendered below the referral summary. */
  children?: ReactNode;
  /** Footer buttons. */
  footer: ReactNode;
  /** Element that opens the dialog. Optional for controlled usage. */
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Fires after the open/close animation finishes. Use for state resets. */
  onOpenChangeComplete?: (open: boolean) => void;
};

// CONFIG
const ROLE_LABEL: Record<AgentRole, string> = {
  primary: "Primary",
  secondary: "Secondary",
};

// SMALLER COMPONENTS
function AgentContact({ agent }: { agent: ReferralDialogAgent }) {
  const fullName = `${agent.firstName} ${agent.lastName}`;
  const initials =
    `${agent.firstName.charAt(0)}${agent.lastName.charAt(0)}`.toUpperCase();

  return (
    <li className="flex min-w-0 flex-col gap-xs">
      <div className="flex items-center gap-sm">
        <Avatar>
          <AvatarFallback className="bg-(--unofficial-accent-2)">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="truncate text-paragraph-small font-medium text-foreground">
          {ROLE_LABEL[agent.role]}: {fullName}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-md text-paragraph-small text-muted-foreground">
        <span className="break-all">{agent.email}</span>
        <span>{agent.phone}</span>
      </div>
    </li>
  );
}

function ReferralSummary({
  clientName,
  referralId,
  submittedAt,
  previousSubmissionAt,
  agents,
}: ReferralDialogReferral) {
  return (
    <div className="flex flex-col gap-md">
      <div className="flex items-start justify-between gap-md">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-lg font-semibold leading-7 text-foreground truncate">
            {clientName}
          </p>
          <p className="text-sm text-muted-foreground">{referralId}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <p className="text-foreground">Submitted {submittedAt}</p>
          {previousSubmissionAt ? (
            <p className="text-muted-foreground">
              Previous submission {previousSubmissionAt}
            </p>
          ) : null}
        </div>
      </div>

      {agents.length > 0 ? (
        <Collapsible defaultOpen={false}>
          <CollapsibleTrigger className="group/agents flex cursor-pointer items-center gap-xs text-paragraph-small font-medium text-foreground">
            Case agents
            <ChevronDown
              aria-hidden="true"
              className="size-4 transition-transform group-data-panel-open/agents:rotate-180"
            />
          </CollapsibleTrigger>
          <CollapsiblePanel className="duration-300 ease-in-out">
            <ul
              className="grid grid-cols-1 gap-md pt-md sm:grid-cols-2"
              aria-label="Case agents"
            >
              {agents.map((agent) => (
                <AgentContact
                  key={`${agent.role}-${agent.email}`}
                  agent={agent}
                />
              ))}
            </ul>
          </CollapsiblePanel>
        </Collapsible>
      ) : null}
    </div>
  );
}

// LAYOUT
export default function ReferralDialogLayout({
  title,
  description,
  referral,
  children,
  footer,
  trigger,
  open,
  onOpenChange,
  onOpenChangeComplete,
}: ReferralDialogLayoutProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      {trigger && <DialogTrigger render={trigger as ReactElement} />}
      {/* Anchored near the top instead of vertically centered, so expanding
          "Case agents" grows the dialog downward rather than shifting it up. */}
      <DialogContent className="sm:max-w-lg top-5xl translate-y-0 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription className="text-black leading-4">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogBody>
          <ReferralSummary {...referral} />
          {children}
        </DialogBody>
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
