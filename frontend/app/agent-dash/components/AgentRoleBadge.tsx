import { Badge } from "@/common/components/ui/badge";
import { cn } from "@/common/lib/utils";

import type { AgencyAgentRole } from "../data/mockAgents";

const ROLE_STYLES: Record<AgencyAgentRole, string> = {
  Agent: "border-transparent bg-sky-100 text-sky-900",
  Admin: "border-transparent bg-purple-100 text-purple-900",
};

type AgentRoleBadgeProps = {
  role: AgencyAgentRole;
  className?: string;
};

export function AgentRoleBadge({ role, className }: AgentRoleBadgeProps) {
  return (
    <Badge
      className={cn(
        "rounded-lg px-xs py-[2px] font-normal",
        ROLE_STYLES[role],
        className
      )}
    >
      {role}
    </Badge>
  );
}
