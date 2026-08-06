"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import {
  BigToggleButton,
  DataTable,
  DataTableSearchEmptyState,
} from "@/common/components/data-display";
import { Button } from "@/common/components/ui/button";
import { AGENT_DASH_AGENT, AGENT_DASH_AGENTS_NEW } from "@/common/constants";
import { cn } from "@/common/lib/utils";
import {
  isAgencyAdminAgent,
  useAuthStore,
} from "@/common/stores/authStore";

import {
  AGENT_ROLE_PILLS,
  AGENT_ROLES,
  makeAgentRows,
  type AgencyAgentRole,
} from "../data/mockAgents";
import { agentColumns } from "./agentColumns";

type RoleFilter = "all" | AgencyAgentRole;

const SORT_OPTIONS = [
  {
    value: "name_az",
    label: "Agent name (A-Z)",
    sorting: [{ id: "agentName", desc: false }],
  },
  {
    value: "name_za",
    label: "Agent name (Z-A)",
    sorting: [{ id: "agentName", desc: true }],
  },
  {
    value: "pending_desc",
    label: "Pending referrals (high–low)",
    sorting: [{ id: "pendingReferrals", desc: true }],
  },
  {
    value: "delivered_desc",
    label: "Delivered referrals (high–low)",
    sorting: [{ id: "deliveredReferrals", desc: true }],
  },
];

export function AgentsView() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const canAddAgent = isAgencyAdminAgent(user);
  const [rows] = useState(() => makeAgentRows());
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  const roleCounts = useMemo(() => {
    const counts: Record<AgencyAgentRole, number> = {
      Admin: 0,
      Agent: 0,
    };
    for (const row of rows) {
      counts[row.role] += 1;
    }
    return counts;
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (roleFilter === "all") return rows;
    return rows.filter((row) => row.role === roleFilter);
  }, [rows, roleFilter]);

  const handleRoleToggle = (role: AgencyAgentRole) => {
    setRoleFilter((current) => (current === role ? "all" : role));
  };

  const pillCounts = {
    all: rows.length,
    Admin: roleCounts.Admin,
    Agent: roleCounts.Agent,
  };

  return (
    <div className="flex flex-col gap-xl">
      <div className="grid grid-cols-1 gap-lg sm:grid-cols-2">
        {AGENT_ROLES.map((role) => (
          <BigToggleButton
            key={role}
            count={roleCounts[role]}
            label={role === "Admin" ? "Admins" : "Agents"}
            selected={roleFilter === role}
            onClick={() => handleRoleToggle(role)}
          />
        ))}
      </div>

      <DataTable
        columns={agentColumns}
        data={filteredRows}
        searchPlaceholder="Search"
        emptyStateMessage="No agents found"
        emptyState={({ globalFilter }) => (
          <DataTableSearchEmptyState query={globalFilter} />
        )}
        defaultSortValue="name_az"
        sortOptions={SORT_OPTIONS}
        header={
          <div className="flex flex-wrap items-center justify-between gap-sm">
            <h2 className="text-heading-3 font-semibold text-foreground">
              Agents
            </h2>
            {canAddAgent ? (
              <Button
                nativeButton={false}
                render={<Link href={AGENT_DASH_AGENTS_NEW} />}
              >
                <Plus className="size-4" data-icon="inline-start" />
                Add new agent
              </Button>
            ) : null}
          </div>
        }
        toolbarLeading={
          <div className="flex flex-wrap items-center gap-xs">
            {AGENT_ROLE_PILLS.map((pill) => {
              const isActive = roleFilter === pill.value;
              const count = pillCounts[pill.value];

              return (
                <button
                  key={pill.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setRoleFilter(pill.value)}
                  className={cn(
                    "rounded-lg px-sm py-xs text-paragraph-small font-medium transition-colors",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  {pill.label} ({count})
                </button>
              );
            })}
          </div>
        }
        onRowClick={(row) => {
          router.push(AGENT_DASH_AGENT(row.id));
        }}
        testId="agency-agents-table"
      />
    </div>
  );
}
