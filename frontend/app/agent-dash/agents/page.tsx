"use client";

import { AgentDashShell } from "../components/AgentDashShell";
import { AgentsView } from "../components/AgentsView";

export default function AgentDashAgentsPage() {
  return (
    <AgentDashShell activeItem="agents">
      <AgentsView />
    </AgentDashShell>
  );
}
