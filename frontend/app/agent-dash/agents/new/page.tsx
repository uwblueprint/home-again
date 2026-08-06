"use client";

import { AgentDashShell } from "../../components/AgentDashShell";
import { AddNewAgentView } from "../../components/AddNewAgentView";

export default function AddNewAgentPage() {
  return (
    <AgentDashShell activeItem="agents">
      <AddNewAgentView />
    </AgentDashShell>
  );
}
