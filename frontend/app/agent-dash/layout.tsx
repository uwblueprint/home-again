"use client";

import type { ReactNode } from "react";

import { AgentDashAuthGate, AgentDashShell } from "@/app/agent-dash/components";

export default function AgentDashLayout({ children }: { children: ReactNode }) {
  return (
    <AgentDashAuthGate>
      <AgentDashShell>{children}</AgentDashShell>
    </AgentDashAuthGate>
  );
}
