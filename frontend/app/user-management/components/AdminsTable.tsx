"use client";

import { useState } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { ActiveAdminsTable } from "./ActiveAdminsTable";
import { InvitedAdminsTable } from "./InvitedAdminsTable";
import type { ActiveAdminRow } from "./ActiveAdminsTableColumns";
import type { InvitedAdminRow } from "./InvitedAdminsTableColumns";

type AdminTab = "active" | "invited";

interface AdminsTableProps {
  activeAdmins: ActiveAdminRow[];
  invitedAdmins: InvitedAdminRow[];
  loading?: boolean;
  error?: Error | null;
}

export function AdminsTable({
  activeAdmins,
  invitedAdmins,
  loading = false,
  error = null,
}: AdminsTableProps) {
  const [tab, setTab] = useState<AdminTab>("active");

  return (
    <div className="flex flex-col gap-md">
      <h2 className="text-heading-3 font-semibold text-foreground">
        Manage Admins
      </h2>

      <Tabs value={tab} onValueChange={(value) => setTab(value as AdminTab)}>
        <TabsList variant="line" aria-label="Admin status">
          <TabsTrigger value="active">
            Active Admins ({activeAdmins.length})
          </TabsTrigger>
          <TabsTrigger value="invited">
            Invited ({invitedAdmins.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "active" ? (
        <ActiveAdminsTable data={activeAdmins} loading={loading} error={error} />
      ) : (
        <InvitedAdminsTable data={invitedAdmins} loading={loading} error={error} />
      )}
    </div>
  );
}
