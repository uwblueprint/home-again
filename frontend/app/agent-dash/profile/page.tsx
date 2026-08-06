"use client";

import { AgentDashShell } from "../components/AgentDashShell";
import { ProfileView } from "../components/ProfileView";

export default function AgentDashProfilePage() {
  return (
    <AgentDashShell>
      <ProfileView />
    </AgentDashShell>
  );
}
