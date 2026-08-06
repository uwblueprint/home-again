"use client";

import { useState } from "react";

import { AgentDashShell } from "./components/AgentDashShell";
import { ClientReferralsView, type StatusFilter } from "./components/ClientReferralsView";

export default function AgentDashPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  return (
    <AgentDashShell>
      <ClientReferralsView
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
    </AgentDashShell>
  );
}
