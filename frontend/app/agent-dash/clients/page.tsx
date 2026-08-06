"use client";

import { AgentDashShell } from "../components/AgentDashShell";
import { ClientsView } from "../components/ClientsView";

export default function AgentDashClientsPage() {
  return (
    <AgentDashShell activeItem="clients">
      <ClientsView />
    </AgentDashShell>
  );
}
